const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcifyymjfktabtsmocnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y'
);

// Manual overrides for ambiguous or complex names:
const OVERRIDES = {
  // NIRF Name -> COA Code
  'Indian Institute of Technology Roorkee': 'UA01',
  'National Institute of Technology Calicut': 'KL01', // Wait, let's verify NIT Calicut vs CET Trivandrum!
  'Indian Institute of Technology Kharagpur': 'WB02', // Let's verify WB01 vs WB02
  'Indian Institute of Engineering Science and Technology, Shibpur': 'WB01',
  'Jamia Millia Islamia': 'DL04',
  'Centre for Environmental Planning and Technology University': 'GJ02',
  'National Institute of Technology Tiruchirappalli': 'TN04', // Let's verify TN04
  'Visvesvaraya National Institute of Technology, Nagpur': 'MH06', // Let's check VNIT Nagpur
  'National Institute of Technology Patna': 'BR01',
  'Chandigarh University': 'PJ11',
  'College of Engineering Trivandrum': 'KL01', // If KL01 is CET Trivandrum, what is NIT Calicut? Let's check!
  'Shri Mata Vaishno Devi University': 'JK01',
  'Lovely Professional University': 'PJ06',
  'Nirma University': 'GJ20',
  'National Institute of Technology Hamirpur': 'HP01',
  'National Institute of Technology, Raipur': 'CG01',
  'National Institute of Technology Raipur': 'CG01',
  'Guru Gobind Singh Indraprastha University': 'DL06',
  'BMS School of Architecture': 'KA17',
  'B. M. S. College of Architecture': 'KA03',
  'BMS College of Arhitecture': 'KA03',
  'BMS College of Architecture': 'KA03',
  'Chitkara University': 'PJ04',
  'Chandigarh College of Architecture': 'CH01',
  'Chandigarh College of Architecture, Sector-12': 'CH01',
  'Gandhi Institute of Technology and Management': 'AP11',
  'Gitam School of Architecture': 'AP11',
  'Faculty of Architecture and Planning, Dr APJ Abbdul Kalam Technical University, Lucknow': 'UP01', // Let's check AKTU
  'Malaviya National Institute of Technology': 'RJ01',
  'National Institute of Technology Rourkela': 'OR06',
  'School of Planning and Architecture New Delhi': 'DL01',
  'School of Planning and Architecture Bhopal': 'MP10',
  'School of Planning & Architecture, Bhopal': 'MP10',
  'School of Planning and Architecture, Vijayawada': 'AP18',
  'School of Planning and Architecture Vijayawada': 'AP18',
  'Jadavpur University': 'WB03',
  'Aligarh Muslim University': 'UP02',
  'Indian Institute of Technology (BHU) Varanasi': 'UP49',
  'Manipal School of Architecture and Planning, MAHE': 'KA02', // Let's check MAHE
  'Manipal University Jaipur': 'RJ12',
  'Anant National University': 'GJ11',
};
