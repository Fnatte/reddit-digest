ssh root@95.85.43.196 <<'ENDSSH'
cd /var/www/reddit-digest
git reset --hard HEAD && git clean -f -d
git pull origin master
yarn
pm2 restart reddit-digest
ENDSSH

