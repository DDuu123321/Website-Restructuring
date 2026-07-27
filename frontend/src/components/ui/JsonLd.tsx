/** Server-component-friendly JSON-LD injector. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  )
}

/**
 * JSON.stringify alone is NOT safe inside a <script> block: CMS-authored text
 * (a project title, an article summary) containing `</script>` closes the tag
 * early and everything after it becomes live markup on a public page. Escaping
 * `<`, `>` and `&` as \uXXXX keeps the JSON semantically identical — parsers
 * decode the escapes — while making tag-breakout impossible.
 */
function serialize(data: object | object[]): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
