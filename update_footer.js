const fs = require('fs');
let content = fs.readFileSync('components/Footer.tsx', 'utf8');

const whatsappFooterText = /Message on WhatsApp/g;
content = content.replace(whatsappFooterText, `<span className="flex items-center gap-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.372 0 0 5.373 0 12c0 2.122.553 4.12 1.528 5.864L0 24l6.302-1.654A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" fill="#25D366"/><path fillRule="evenodd" clipRule="evenodd" d="M17.472 14.304c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.882-.788-1.477-1.761-1.65-2.059-.173-.298-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.371-.025-.52-.074-.149-.669-1.611-.916-2.206-.241-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.793.371-.272.298-1.04 1.016-1.04 2.478s1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.71.307 1.264.49 1.695.627.712.227 1.36.195 1.871.118.572-.086 1.758-.718 2.006-1.412.248-.694.248-1.288.173-1.412-.074-.124-.272-.198-.57-.347z" fill="#FFF"/></svg> WhatsApp</span>`);

fs.writeFileSync('components/Footer.tsx', content);
console.log("Updated Footer WhatsApp text");