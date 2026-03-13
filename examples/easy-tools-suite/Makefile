.PHONY: run install clean docker-up docker-down

install:
	pip install -r requirements.txt

run:
	python app.py

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

clean:
	rm -rf instance/ __pycache__/
