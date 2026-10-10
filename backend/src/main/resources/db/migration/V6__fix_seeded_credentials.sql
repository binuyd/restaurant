-- V6__fix_seeded_credentials.sql
UPDATE users 
SET password_hash = (SELECT password_hash FROM users WHERE email = 'admin@restaurant.com')
WHERE email = 'admin@gourmet.com'
	AND EXISTS (SELECT 1 FROM users WHERE email = 'admin@restaurant.com');

UPDATE users 
SET password_hash = (SELECT password_hash FROM users WHERE email = 'test@gourmet.com')
WHERE email = 'customer@gourmet.com'
	AND EXISTS (SELECT 1 FROM users WHERE email = 'test@gourmet.com');
