const fs = require('fs');

let content = fs.readFileSync('app/admin/catalog/page.tsx', 'utf8');

const oldInsert = `-- Insert core requested columns
INSERT INTO catalog_columns (id, title, type, order_index, is_core) VALUES
('building_name', 'Building Name', 'text', 1, true),
('city', 'City', 'text', 2, false),
('country', 'Country', 'text', 3, false),
('architect', 'Architect', 'text', 4, false),
('architect_other_projects', 'Architect''s Other Projects', 'link', 5, false),
('opened_year', 'Opened Year', 'number', 6, false),
('architect_photo', 'Architect Photo', 'image', 7, false),
('building_photo', 'Building Photo', 'image', 8, false),
('prize_winning_year', 'Prize Winning Year', 'text', 9, false)
ON CONFLICT (id) DO NOTHING;`;

const newInsert = `-- Insert specific requested columns
INSERT INTO catalog_columns (id, title, type, order_index, is_core) VALUES
('building_name', 'Building Name', 'text', 1, true),
('architect', 'Architect', 'text', 2, false),
('opened_year', 'Opened Year', 'number', 3, false),
('building_photo', 'Building Photo', 'image', 4, false),
('architect_photo', 'Architect''s Photo', 'image', 5, false),
('building_location', 'Location of the Building', 'text', 6, false),
('architect_native', 'Architect''s Native', 'text', 7, false),
('architect_other_projects', 'Architect''s Other Projects', 'text', 8, false),
('pritzker_prize_year', 'Pritzker Prize Winning Year', 'number', 9, false)
ON CONFLICT (id) DO NOTHING;`;

if (content.includes("INSERT INTO catalog_columns")) {
    // Replace using regex to grab the whole block just in case
    content = content.replace(/-- Insert core requested columns[\s\S]*?ON CONFLICT \(id\) DO NOTHING;/, newInsert);
    fs.writeFileSync('app/admin/catalog/page.tsx', content);
    console.log("SQL snippet updated successfully.");
} else {
    console.log("Could not find the SQL snippet.");
}
