FROM python:3.6.9

COPY . .

RUN pip install pipenv
RUN pipenv --python 3.6
RUN pipenv install

CMD ["pipenv", "run", "python3", "app.py"]
