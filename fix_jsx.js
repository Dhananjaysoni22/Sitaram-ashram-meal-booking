const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Home.tsx', 'utf8');

c = c.replace(
  '          ) : (\n            <div className="bg-white rounded-2xl border border-[#ece4da]',
  '          ) : (\n            <>\n            <div className="bg-white rounded-2xl border border-[#ece4da]'
);

c = c.replace(
  '              </div>\n            )}\n        )}\n      </div>',
  '              </div>\n            )}\n            </>\n        )}\n      </div>'
);

fs.writeFileSync('frontend/src/pages/Home.tsx', c);
console.log("Done");
