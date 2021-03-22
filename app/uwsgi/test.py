def application(env, start_response):
    start_response("418 I'm a teapot", [('Content-Type', 'text/html')])
    return [b"""
    <!doctype html>
        <html>
            <h1>418</h1>
            <p>I'm a teapot</p>
        </html>
    """]
