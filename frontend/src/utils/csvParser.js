export const parseCSV = (text) => {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length < 2) return [];
  
  // Normalize headers (e.g. "Full Name" -> "fullname")
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((h, idx) => {
      // Map common header variations to expected backend keys
      let key = h;
      if (h.includes('name')) key = 'fullName';
      if (h.includes('mail')) key = 'email';
      if (h.includes('pass')) key = 'password';
      if (h.includes('roll')) key = 'rollNumber';
      
      obj[key] = values[idx] || '';
    });
    result.push(obj);
  }
  return result;
};
