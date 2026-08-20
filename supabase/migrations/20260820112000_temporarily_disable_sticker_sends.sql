-- Sticker ownership remains intact while sticker correspondence is temporarily
-- removed from the active send catalog. The delivery RPC already requires an
-- active correspondence option, so direct clients are blocked as well.
update public.correspondence_options
set status = 'archived'
where type = 'sticker';
