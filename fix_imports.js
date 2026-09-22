const fs = require('fs');
let code = fs.readFileSync('components/home/InteractiveHome.tsx', 'utf8');

const regex = /import \{.*?\} from "lucide-react";/;
code = code.replace(regex, 'import { Search, MapPin, Building2, ArrowRight, MessageCircle, Globe, Mail, Smartphone, Instagram, Facebook, Twitter, Send } from "lucide-react";');

fs.writeFileSync('components/home/InteractiveHome.tsx', code);
