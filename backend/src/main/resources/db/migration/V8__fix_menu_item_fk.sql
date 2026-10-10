-- V8__fix_menu_item_fk.sql
SELECT 1;
/*
    -- Drop legacy foreign key pointing to food_items
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='order_items_food_item_id_fkey'
    ) THEN 
        ALTER TABLE order_items DROP CONSTRAINT order_items_food_item_id_fkey;
    END IF;

    -- Add proper foreign key to menu_items if not present
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='order_items_menu_item_id_fkey'
    ) THEN 
        ALTER TABLE order_items ADD CONSTRAINT order_items_menu_item_id_fkey 
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE;
    END IF;

*/
