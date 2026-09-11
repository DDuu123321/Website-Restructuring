# Bluven Partner Lead Import API

Push customer leads into Bluven Energy's CRM in batches. One request creates up to 200 leads; each lead is validated and reported individually.

## Endpoint

```
POST https://<cms-host>/api/partner-import
Content-Type: application/json
Authorization: users API-Key <your-api-key>
```

Bluven issues each partner its own API key. Keep it server-side; it can be revoked at any time. The key works on this endpoint only — any other URL returns `403`.

## Request body

```json
{
  "leads": [
    {
      "firstName": "Jane",
      "lastName": "Smith",
      "phone": "0412 345 678",
      "email": "jane@example.com",
      "address": "12 Sample St",
      "suburb": "Parramatta",
      "state": "NSW",
      "postcode": "2150",
      "propertyType": "House",
      "components": ["Solar", "Battery"],
      "systemKw": 6.6,
      "batteryKwh": 10,
      "monthlyBill": 350,
      "timeline": "1-month",
      "bestTime": "afternoon",
      "notes": "Referred from our website enquiry form.",
      "householdSize": "4",
      "goals": ["Lower my bills", "Backup during blackouts"],
      "productPreference": "Tesla Powerwall 3"
    }
  ]
}
```

`leads` must be a non-empty array of 1–200 objects, and the whole request body must stay under 100 KB (200 fully populated leads are about 75 KB; keep `notes` short in large batches). Unknown fields are ignored.

### Fields

| Field | Type | Required | Accepted values |
|---|---|---|---|
| `firstName` | string | **yes** | |
| `lastName` | string | no | |
| `phone` | string | **yes** | 8–15 digits; spaces, dashes and a `+61` prefix are fine |
| `email` | string | no | Valid email address |
| `address` | string | no | Street address |
| `suburb` | string | no | |
| `state` | string | no | `NSW` `VIC` `QLD` `SA` `WA` `TAS` `ACT` `NT` |
| `postcode` | string | no | 4-digit Australian postcode |
| `propertyType` | string | no | `House` · `Townhouse / Unit` · `Commercial` |
| `components` | string[] | no | Any of `Solar` `Battery` `EV` `Heat pump` (a single string is accepted too) |
| `systemKw` | number | no | Desired solar size (kW). JSON number or numeric string; anything else fails the row |
| `batteryKwh` | number | no | Desired battery size (kWh) |
| `monthlyBill` | number | no | Monthly power bill (AUD) |
| `timeline` | string | no | `asap` · `1-month` · `1-3-months` · `researching` |
| `bestTime` | string | no | `anytime` · `morning` · `afternoon` · `evening` · `email-only` · `weekend` |
| `notes` | string | no | Free text, max 5000 characters |
| `householdSize` | string or number | no | Number of people in the household, e.g. `4` or `"3-4"`. Alias: `household_size` |
| `goals` | string or string[] | no | What the customer wants to achieve, in your own words. An array is joined with commas |
| `productPreference` | string or string[] | no | Preferred product type, brand or model. Alias: `product_preference` |

## Response

`200 OK` — the batch was processed. Check every row: a single invalid lead does **not** fail the batch.

```json
{
  "created": 2,
  "failed": 1,
  "results": [
    { "index": 0, "ok": true,  "id": 1042 },
    { "index": 1, "ok": true,  "id": 1043 },
    { "index": 2, "ok": false, "error": "phone: Please enter a valid phone number." }
  ]
}
```

`index` is the position in the `leads` array you sent. Re-send only the rows that failed after fixing them; there is no automatic de-duplication, so do not re-send rows that already returned `ok: true`.

### Errors

| Status | Meaning |
|---|---|
| `400` | `leads` missing, empty, or more than 200 rows |
| `401` | Missing or invalid API key |
| `403` | Key is not a partner key, or the key was used on a different endpoint |
| `413` | Request body over 100 KB — send a smaller batch. Body is `{ "errors": [{ "message": "request entity too large" }] }` |
| `429` | More than 30 requests in a minute — wait and retry |

## Example

```bash
curl -X POST https://<cms-host>/api/partner-import \
  -H "Content-Type: application/json" \
  -H "Authorization: users API-Key YOUR_KEY" \
  -d '{"leads":[{"firstName":"Jane","lastName":"Smith","phone":"0412345678","email":"jane@example.com","postcode":"2150","state":"NSW"}]}'
```

## Notes

- Leads land in Bluven's system with the status **New** and are tagged with your partner name; Bluven's team follows up by phone.
- No confirmation email is sent to the customer by this endpoint.
- Send batches sequentially rather than in parallel.
