export async function script(ctx: Context) {
  const {
    clients: { googleTagManagerScripts },
    vtex: {
      route: { params },
    },
  } = ctx

  const { name } = params

  if (!name) {
    ctx.status = 404
    ctx.body = 'Not found'

    return
  }

  // converting query parameters to string
  const paramsString = Object.keys(ctx.query)
    .map((key) => `${key}=${ctx.query[key]}`)
    .join('&')

  let data = ''

  if (name === 'gtm.js') {
    data = await googleTagManagerScripts.getMainScript(
      name.toString(),
      paramsString
    )
  } else {
    data = await googleTagManagerScripts.getScript(
      name.toString(),
      paramsString
    )
  }

  ctx.header['Content-Type'] = 'application/javascript'
  ctx.header['Cache-Control'] = 'private, max-age=900'
  ctx.body = data
}
