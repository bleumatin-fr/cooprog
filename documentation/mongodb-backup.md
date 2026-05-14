# MongoDB Backup Management

## How to create a backup archive

The GitHub Actions at `.github/workflows/production-backup.yml` is configured to take Production MongoDB backups on a regular basis.

It's also possible to create a backup manually by following the instructions below:

- On the `bleumatin-fr/cooprog` repository, click on the `Actions` tab
- Click on the `Production backup` workflow
- On the right, click `Run workfow` and select the main branch

A new backup archive will be stored on the repository.

## How to restore from a backup archive

- Download a selected backup archive from the repository
- For example, download the latest file (example: `2024-02-29T15_58_10.mongodump`)
- Upload the backup archive to the production instance of CooProg in the following folder

```bash
scp [ARCHIVE] [INSTANCE]:~/coprog_production/deployment/cooprog_production/.docker/mongo/backup/

# example
scp ./2024-02-29T15_58_10.mongodump cooprog-prod:~/coprog_production/deployment/cooprog_production/.docker/mongo/backup/
```

- Lastly, restore the MongoDB container with the uploaded archive:

```bash
docker compose \
    -f ~/coprog_production/deployment/cooprog_production/docker-compose.yml \
    exec cooprog_mongo \
    mongorestore "[MONGODB_URI]" --archive=/data/backup/[ARCHIVE]

# example
docker compose \
    -f ~/coprog_production/deployment/cooprog_production/docker-compose.yml \
    exec cooprog_mongo \
    mongorestore "mongodb://localhost" --archive=/data/backup/2024-02-29T15_58_10.mongodump
```
