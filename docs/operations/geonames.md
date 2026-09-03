# Catálogo de cidades GeoNames

The private nest search uses the GeoNames `cities15000` and `admin1CodesASCII` dumps. DUIF imports these catalogs into
Supabase; the game never requests GeoNames at runtime. The map remains an OpenStreetMap visual
layer, and neither source receives the player's chosen nest coordinate.

## Import

Run the import after applying migrations, initially and every six months:

```sh
scripts/import-geonames-cities.sh --db-url "$DATABASE_URL" --operator "your-name"
```

The command downloads and validates both datasets, records their SHA-256 values and source date,
upserts cities and administrative regions by GeoNames ID/code, and archives records absent from the
new dump. It also normalizes existing player-facing region labels and delivery snapshots only when
they still match the current profile location. It does not record player search terms. It uses a
local Supabase database container automatically when `psql` is unavailable; remote imports require
a privileged database URL and a local `psql` client.

## Administrative refresh

Administrators can also run the same refresh from **/admin/geonames**. The browser
only requests the job: the Edge Function downloads the archive directly from GeoNames, verifies and
stages it privately, then swaps the active records in one database transaction. A failed download,
validation, or staging step therefore leaves the active catalog unchanged. The panel retains the
source checksums, operator, timestamps, outcome, and import counts for audit.

The CLI command above remains the recovery path if the administrative function is unavailable. Do
not upload GeoNames dumps through the browser or expose a database URL to the client.

## Attribution

GeoNames data is used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) with
attribution to [GeoNames](https://www.geonames.org/). Keep the source and dataset identifiers in
`geonames_import_runs` intact when updating the catalog. Refresh-job audit records retain source
checksums and operational metadata; neither they nor the import process retain player searches.

Google Places is not configured for city search. It may be evaluated separately for a future
point-of-interest feature, never as a substitute for this catalog.
