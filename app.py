from flask import Flask

import json

import db
import mail
import tokens
import tasks
from util.flaskjson import CustomJSONEncoder

import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

from wikispeedruns import lobbys
def create_app(test_config=None):

    app = Flask(__name__)

    app.json_encoder = CustomJSONEncoder

    app.config.from_file('config/default.json', json.load)

    if test_config is None:
        # load prod settings if not testing and if they exist
        try:
            app.config.from_file('config/prod.json', json.load)
        except FileNotFoundError:
            pass
    else:
        app.config.update(test_config)


    # Setup monitoring if enabled
    if (app.config.get("SENTRY_ENABLED")):
        sentry_sdk.init(
            dsn="https://3fcc7c6b479248c8ac9839aad0440cba@o1133616.ingest.sentry.io/6180332",
            integrations=[FlaskIntegration()],
            # Set percent of things that are traced
            traces_sample_rate=0
        )


    db.init_app(app)
    mail.init_app(app)
    tokens.init_app(app)
    tasks.make_celery(app)

    from apis.sprints_api import sprint_api
    from apis.runs_api import run_api
    from apis.users_api import user_api
    from apis.profiles_api import profile_api
    from apis.scraper_api import scraper_api
    from apis.ratings_api import ratings_api
    from apis.stats_api import stats_api
    from apis.marathon_api import marathon_api
    from apis.lobbys_api import lobby_api
    from apis.leaderboard_api import leaderboard_api
    from apis.generator_api import generator_api, load_page_rank
    from apis.achievements_api import achievements_api
    from views import views

    app.register_blueprint(sprint_api)
    app.register_blueprint(run_api)
    app.register_blueprint(user_api)
    app.register_blueprint(profile_api)
    app.register_blueprint(scraper_api)
    app.register_blueprint(ratings_api)
    app.register_blueprint(stats_api)
    app.register_blueprint(marathon_api)
    app.register_blueprint(lobby_api)
    app.register_blueprint(generator_api)
    app.register_blueprint(views)
    app.register_blueprint(leaderboard_api)
    app.register_blueprint(achievements_api)

    # Hacky way to load in
    try:
        load_page_rank(app)
    except Exception as e:
        print(e)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=False, host="0.0.0.0", port=5000)
