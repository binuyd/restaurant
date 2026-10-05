-- V3__align_order_items.sql
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='order_items' AND column_name='food_item_id'
    ) THEN 
        ALTER TABLE order_items RENAME COLUMN food_item_id TO menu_item_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='order_items' AND column_name='menu_item_id'
    ) THEN 
        ALTER TABLE order_items ADD COLUMN menu_item_id BIGINT REFERENCES menu_items(id);
    END IF;
END $$;
