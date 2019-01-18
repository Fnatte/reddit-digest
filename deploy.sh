ssh root@95.85.43.196 <<'ENDSSH'
cd /var/www/reddit-digest
git reset --hard HEAD && git clean -f -d
git pull origin master
yarn
docker build -t reddit-digest .
docker stop reddit-digest-container
docker run --rm -d -p 5000:5000 --name reddit-digest-container reddit-digest
ENDSSH

