ssh root@95.85.43.196 <<'ENDSSH'
cd /var/www/reddit-digest
git reset --hard HEAD
git pull origin master
docker build -t reddit-digest .
docker stop reddit-digest-container || true
docker rm reddit-digest-container || true
docker run -d -p 5000:5000 --name reddit-digest-container reddit-digest
ENDSSH

