-- V7__relax_legacy_manual_constraints.sql
DO $$ 
BEGIN 
    -- If line_total exists on order_items, make it nullable or default to 0.00
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='order_items' AND column_name='line_total'
    ) THEN 
        ALTER TABLE order_items ALTER COLUMN line_total DROP NOT NULL;
        ALTER TABLE order_items ALTER COLUMN line_total SET DEFAULT 0.00;
    END IF;

    -- If any other manual columns exist on orders that are NOT NULL without default, relax them
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='table_id'
    ) THEN 
        ALTER TABLE orders ALTER COLUMN table_id DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='subtotal'
    ) THEN 
        ALTER TABLE orders ALTER COLUMN subtotal DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='tax'
    ) THEN 
        ALTER TABLE orders ALTER COLUMN tax DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='service_charge'
    ) THEN 
        ALTER TABLE orders ALTER COLUMN service_charge DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='discount'
    ) THEN 
        ALTER TABLE orders ALTER COLUMN discount DROP NOT NULL;
    END IF;

END $$;
