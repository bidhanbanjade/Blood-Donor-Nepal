BEGIN;

-- Normalize legacy roles to the new receiver role.
UPDATE users
SET role = 'receiver'
WHERE role IN ('hospital', 'blood_bank');

-- Replace existing role check with the simplified role model.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('donor', 'receiver', 'admin'));

COMMIT;
