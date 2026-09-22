const fs = require('fs');
let code = fs.readFileSync('components/home/InteractiveHome.tsx', 'utf8');

code = code.replace(
  'import { Search, MapPin, Building2, ArrowRight, MessageCircle, Globe, Mail, Smartphone, Instagram, Facebook, Twitter, Send } from "lucide-react";',
  'import { Search, MapPin, Building2, ArrowRight, MessageCircle, Globe, Mail, Smartphone, Send } from "lucide-react";\nimport { InstagramIcon, FacebookIcon, TwitterIcon } from "@/components/icons/SocialIcons";'
);

fs.writeFileSync('components/home/InteractiveHome.tsx', code);
