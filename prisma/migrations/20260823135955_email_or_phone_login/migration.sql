-- Email is no longer the sole login identifier: it becomes optional, and
-- phone becomes a unique alternate identifier. At least one of the two is
-- enforced in application validation (see SignupSchema), not here.
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
