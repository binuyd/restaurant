-- V4__align_schema_with_entities.sql
DO $$ 
BEGIN 
    -- 1. Align USERS table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='username'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='name'
    ) THEN 
        ALTER TABLE users RENAME COLUMN username TO name;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='name'
    ) THEN 
        ALTER TABLE users ADD COLUMN name VARCHAR(100) DEFAULT 'User';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='password'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='password_hash'
    ) THEN 
        ALTER TABLE users RENAME COLUMN password TO password_hash;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='password_hash'
    ) THEN 
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) DEFAULT '';
    END IF;

    -- Ensure role column is varchar compatible if enum was used
    ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(20) USING role::VARCHAR(20);

    -- 2. Align ORDERS table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='total'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='total_amount'
    ) THEN 
        ALTER TABLE orders RENAME COLUMN total TO total_amount;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='total_amount'
    ) THEN 
        ALTER TABLE orders ADD COLUMN total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='version'
    ) THEN 
        ALTER TABLE orders ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='user_id'
    ) THEN 
        ALTER TABLE orders ADD COLUMN user_id BIGINT REFERENCES users(id);
    END IF;

    -- Ensure status column in orders is varchar compatible if enum was used
    ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(30) USING status::VARCHAR(30);

    -- 3. Ensure ORDER_STATUS_HISTORY exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='order_status_history') THEN
        CREATE TABLE order_status_history (
            id BIGSERIAL PRIMARY KEY,
            order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            from_status VARCHAR(30),
            to_status VARCHAR(30) NOT NULL,
            changed_by VARCHAR(100) NOT NULL,
            changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

END $$;
