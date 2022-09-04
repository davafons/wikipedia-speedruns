# Base Image
FROM python:3.8

# Working directory inside app
WORKDIR /app

#Copy the index.html file /usr/share/nginx/html/
COPY . /app

# Install app dependecy
RUN pip install -r requirements.txt

#Expose Nginx Port
EXPOSE 5000

# Start NgixService
ENTRYPOINT ["python"]

CMD ["app.py"]

