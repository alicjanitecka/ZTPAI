-- CREATE TABLE "user" (
--     "id" SERIAL PRIMARY KEY,
--     "email" VARCHAR(255),
--     "password" VARCHAR(255),
--     "first_name" VARCHAR(100),
--     "last_name" VARCHAR(100),
--     "phone" VARCHAR(20),
--     "city" VARCHAR(100),
--     "street" VARCHAR(100),
--     "house_number" VARCHAR(20),
--     "apartment_number" VARCHAR(20),
--     "postal_code" VARCHAR(10)
-- );

CREATE TABLE "pet" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES "user"("id"),
    "name" VARCHAR(100),
    "age" INTEGER,
    "breed" VARCHAR(100),
    "additional_info" TEXT,
    "photo_url" VARCHAR(255),
    "pet_type" VARCHAR(10)
);

CREATE TABLE "petsitter" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES "user"("id"),
    "description" TEXT,
    "is_dog_sitter" BOOLEAN,
    "is_cat_sitter" BOOLEAN,
    "is_rodent_sitter" BOOLEAN,
    "hourly_rate" NUMERIC(10,2),
    "care_at_owner_home" BOOLEAN,
    "care_at_petsitter_home" BOOLEAN,
    "dog_walking" BOOLEAN
);

CREATE TABLE "petsitter_availability" (
    "id" SERIAL PRIMARY KEY,
    "petsitter_id" INTEGER REFERENCES "petsitter"("id"),
    "date" DATE,
    "is_available" BOOLEAN
);

CREATE TABLE "visit" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES "user"("id"),
    "petsitter_id" INTEGER REFERENCES "petsitter"("id"),
    "care_type" VARCHAR(50),
    "start_date" DATE,
    "end_date" DATE,
    "confirmed" BOOLEAN,
    "canceled" BOOLEAN,
    "pets" INTEGER[]
);
