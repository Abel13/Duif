# GeoNames city catalog

The private nest search uses the GeoNames `cities15000` dump. DUIF imports this catalog into
Supabase; the game never requests GeoNames at runtime. The map remains an OpenStreetMap visual
layer, and neither source receives the player's chosen nest coordinate.

## Import

Run the import after applying migrations, initially and every six months:

```sh
scripts/import-geonames-cities.sh --db-url "$DATABASE_URL" --operator "your-name"
```

The command downloads and validates `cities15000.zip`, records its SHA-256 and source date, upserts
cities by GeoNames ID, and archives cities absent from the new dump. It does not record player
search terms. It uses a local Supabase database container automatically when `psql` is unavailable;
remote imports require a privileged database URL and a local `psql` client.

## Attribution

GeoNames data is used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) with
attribution to [GeoNames](https://www.geonames.org/). Keep the source and dataset identifiers in
`geonames_import_runs` intact when updating the catalog.

Google Places is not configured for city search. It may be evaluated separately for a future
point-of-interest feature, never as a substitute for this catalog.
