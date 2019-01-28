ssh root@95.85.43.196 <<'ENDSSH'
cd /var/www/reddit-digest
git fetch origin
git reset --hard origin/master
docker system prune --force
docker build -t reddit-digest .
docker stop reddit-digest-container || true
docker rm reddit-digest-container || true
docker run -d -p 5000:5000 --env-file .env --name reddit-digest-container reddit-digest
ENDSSH

