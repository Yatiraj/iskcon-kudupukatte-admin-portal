-- DB Schema Reference for ISKCON Kudupu-Katte Admin Portal

-- 1. Enum Types
CREATE TYPE donor_type_enum AS ENUM ('HNI', 'Regular', 'One-time');
CREATE TYPE association_status_enum AS ENUM ('Congregation', 'New Devotee', 'Well-wisher');
CREATE TYPE role_enum AS ENUM ('admin', 'viewer');

-- 2. Profiles Table (User Roles)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  role role_enum NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. Devotees Table
CREATE TABLE devotees (
  phone text PRIMARY KEY,
  name text NOT NULL,
  email text,
  address text,
  donor_type donor_type_enum,
  association_status association_status_enum,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_by uuid REFERENCES profiles(id)
);

-- 4. Add Indexes (optional for performance)
CREATE INDEX idx_devotees_donor_type ON devotees(donor_type);
CREATE INDEX idx_devotees_association_status ON devotees(association_status);

-- 5. Example: Add a user to profiles
-- insert into profiles (id, email, role) values ('<user-uuid>', 'admin@example.com', 'admin');

-- 6. Example: Add a devotee
-- insert into devotees (phone, name, donor_type, association_status, created_by) values ('1234567890', 'Test Devotee', 'HNI', 'Congregation', '<admin-uuid>');

-- 7. RLS (Row Level Security) - Disabled for this project, but can be enabled as needed
-- alter table profiles enable row level security;
-- alter table devotees enable row level security;
