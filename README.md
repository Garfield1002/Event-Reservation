# Event Registration System

An example project built on my [React/Django boilerplate](example.com).

## 🖼 Screenshots

![Screenshot](https://github.com/Garfield1002/Event-Reservation/blob/master/Screenshot.png?raw=true)

## 📖 Usage

Prerequisites: Docker and Compose

Configure `EMAIL_HOST_USER` and `EMAIL_HOST_USER` in _app\\django_project\\settings.py_.

You can now start the app by running:

```bash
docker-compose up -d --build

```

It should now be up and running at [http://localhost:8002](http://localhost:8002).

To actually create an event,

1. Create a super user using

   ```bash
       docker-compose exec web python manage.py createsuperuser
   ```

2. You can now log in to [http://localhost:8002/protected/](http://localhost:8002/protected/) to view and manage your events

## 🍕 Contribution

Anyone is welcome to contribute to the quality of this content. Please feel free to submit a PR request for typo fixes, speling corrections, explanation improvements, more speling etc.

Feature requests are also welcome (This is however meant as a usable example/tutorial not necessarily a polished app)

## ⚖ License

MIT
