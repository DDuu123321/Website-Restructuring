import { CollectionConfig } from 'payload/types'

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
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: '⚙️ System',
    description:
      'Admin accounts with access to the management panel. Set at least one account to "Super Admin" — while none exists, every account can manage users.',
    defaultColumns: ['email', 'name', 'role'],
  },
  access: {
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
      ],
      admin: {
        description: 'Super Admins manage user accounts. Editors manage content and leads only.',
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
