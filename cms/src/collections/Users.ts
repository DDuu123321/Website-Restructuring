import { CollectionConfig } from 'payload/types'
import { Forbidden } from 'payload/errors'

/**
 * Super Admins only — with a bootstrap escape hatch.
 *
 * `role` defaults to "editor", including for the very first account created on
 * an empty database, so a strict `role === 'admin'` check would lock the owner
 * out of account management on any existing install. While NO user holds the
 * admin role, every logged-in user is treated as one; the moment someone is
 * promoted to Super Admin the rule tightens automatically and Editors lose
 * account management. Promote your own account under Users → Role to switch
 * the strict rule on.
 *
 * The extra query only runs on user create/update/delete, which are rare.
 */
type AccessReq = { req: { user?: { id?: string | number; role?: string } | null; payload?: any } }

const isAdmin = async ({ req }: AccessReq): Promise<boolean> => {
  if (!req.user) return false
  if (req.user.role === 'admin') return true
  try {
    const admins = await req.payload.find({
      collection: 'users',
      where: { role: { equals: 'admin' } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    return admins.totalDocs === 0     // no admin exists yet → bootstrap mode
  } catch {
    return false                      // fail closed
  }
}

const Users: CollectionConfig = {
  slug: 'users',
  // useAPIKey: partner accounts (role "partner") authenticate to
  // POST /api/partner-import with `Authorization: users API-Key <key>`.
  // server.ts refuses that header on every other route, so a key can never
  // browse leads or content — see the API-key guard in server.ts.
  auth: { useAPIKey: true },
  admin: {
    useAsTitle: 'email',
    group: '⚙️ System',
    description:
      'Admin accounts with access to the management panel. Set at least one account to "Super Admin" — while none exists, every account can manage users.',
    defaultColumns: ['email', 'name', 'role'],
  },
  hooks: {
    // Partner accounts exist only to hold an API key. Two doors could still
    // turn one into a normal logged-in user (every collection's read rule is a
    // plain `!!req.user`): password login, and the public forgot-password →
    // reset-password pair, which mints a JWT without ever running beforeLogin.
    // Both are shut for role "partner". Refusing forgot-password up front also
    // sidesteps a Payload 2 bug (verified on 2.32): that operation feeds the
    // raw DB row back through payload.update(), re-hashing the already-
    // encrypted apiKey and silently killing the key.
    beforeOperation: [
      async ({ args, operation, req }) => {
        if (operation !== 'forgotPassword') return args
        const email = typeof args?.data?.email === 'string' ? args.data.email : ''
        if (!email) return args
        const partner = await req.payload.find({
          collection: 'users',
          where: { and: [{ email: { equals: email } }, { role: { equals: 'partner' } }] },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        if (partner.totalDocs > 0) throw new Forbidden()
        return args
      },
    ],
    beforeLogin: [
      ({ user }) => {
        if (user?.role === 'partner') throw new Forbidden()
        return user
      },
    ],
  },
  access: {
    // Belt and braces with beforeLogin above: no admin panel for partners.
    admin: ({ req }) => Boolean(req.user) && req.user?.role !== 'partner',
    // Was `() => true`, which let anyone GET /api/users and harvest every
    // admin's email/name/role (phishing + credential-stuffing fuel).
    read: ({ req }) => !!req.user,
    // Payload's default for write is "any logged-in user", which made the
    // role field decorative: an Editor could mint themselves a Super Admin
    // account or delete the owner's. Account management is admin-only.
    create: isAdmin,
    delete: isAdmin,
    // Anyone may edit THEIR OWN row (name, password); only admins may touch
    // someone else's. The role field has its own rule below, so a self-edit
    // still cannot grant a promotion.
    update: async ({ req, id }) =>
      (await isAdmin({ req })) || (Boolean(req.user) && String(req.user?.id) === String(id)),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      defaultValue: 'editor',
      options: [
        { label: 'Super Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        // Appended last: Postgres enums only grow at the end
        // (20260909 partner_api_keys migration).
        { label: 'Partner (API only)', value: 'partner' },
      ],
      admin: {
        description:
          'Super Admins manage user accounts. Editors manage content and leads only. Partners cannot log in — tick "Enable API Key" above and hand the generated key to the external company; it may only POST leads to /api/partner-import.',
      },
      // Without this an Editor could promote themselves via the self-edit
      // allowance in `access.update` above.
      access: {
        create: isAdmin,
        update: isAdmin,
      },
    },
  ],
}

export default Users
