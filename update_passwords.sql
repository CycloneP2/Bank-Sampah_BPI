-- SQL script to update dummy user passwords to "123123"
UPDATE "User" 
SET password = '$2a$10$fC.iM.57LnWT/jZ3fBOXc.N.XkTjStE0tRXfUZkenJIC.6Kk.5zhK' 
WHERE id IN ('ADMIN001', 'STAFF001', 'STAFF002', 'NS001', 'NS002', 'NS003', 'NS004', 'NS005');
