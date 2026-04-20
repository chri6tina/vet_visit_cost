const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 1. Load Environment Variables Manually (To avoid requiring 'dotenv' package)
const envFile = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = match[2].replace(/['"]/g, ''); // Strip quotes if any
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
// CRITICAL: We use the SERVICE ROLE key to bypass RLS and insert data immediately.
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 2. The Highly Researched Core 50 Procedures Dataset
const procedures = [
  // --- PREVENTATIVE & WELLNESS ---
  {
    name: "Comprehensive Wellness Exam",
    slug: "wellness-exam",
    category: "Preventative",
    species: ["Dog", "Cat"],
    description: "A thorough nose-to-tail physical exam performed by a veterinarian. Vital for catching early signs of disease like heart murmurs, dental disease, or lumps.",
    avg_cost_low: 50,
    avg_cost_high: 95,
    avg_cost_national: 65,
    notes: "Does not include additional diagnostics or vaccines."
  },
  {
    name: "Rabies Vaccine (1-Year)",
    slug: "rabies-vaccine-1-year",
    category: "Preventative",
    species: ["Dog", "Cat"],
    description: "A core, legally mandated vaccine protecting against the fatal rabies virus. The 1-year version is typically given to puppies/kittens or pets with unknown vaccination history.",
    avg_cost_low: 15,
    avg_cost_high: 40,
    avg_cost_national: 25,
    notes: "Often heavily discounted at low-cost community clinics."
  },
  {
    name: "Rabies Vaccine (3-Year)",
    slug: "rabies-vaccine-3-year",
    category: "Preventative",
    species: ["Dog", "Cat"],
    description: "The extended-duration version of the rabies vaccine. It is identical to the 1-year vaccine in formulation but legally licensed for 3-year protection in adult pets.",
    avg_cost_low: 25,
    avg_cost_high: 60,
    avg_cost_national: 40,
    notes: "Pet must have a prior documented 1-year vaccine to qualify."
  },
  {
    name: "Distemper / Parvo Vaccine (DHPP/DA2PP)",
    slug: "dhpp-vaccine-dog",
    category: "Preventative",
    species: ["Dog"],
    description: "A critical core vaccine for dogs. It protects against four dangerous viruses: Canine Distemper, Adenovirus (Hepatitis), Parainfluenza, and Parvovirus.",
    avg_cost_low: 20,
    avg_cost_high: 55,
    avg_cost_national: 35,
    notes: "Requires a series of 3-4 boosters for puppies, and then every 1-3 years."
  },
  {
    name: "Feline Viral Rhinotracheitis Vaccine (FVRCP)",
    slug: "fvrcp-vaccine-cat",
    category: "Preventative",
    species: ["Cat"],
    description: "The core combination vaccine for cats. Protects against Rhinotracheitis (Herpesvirus), Calicivirus, and Panleukopenia (Feline Distemper).",
    avg_cost_low: 20,
    avg_cost_high: 50,
    avg_cost_national: 35,
    notes: "Highly contagious upper respiratory diseases are common; this is essential for indoor and outdoor cats."
  },
  {
    name: "Bordetella Vaccine (Kennel Cough)",
    slug: "bordetella-vaccine",
    category: "Preventative",
    species: ["Dog"],
    description: "A non-core vaccine that protects against Bordetella bronchiseptica, the primary bacteria responsible for kennel cough. Required by most groomers, boarding facilities, and daycares.",
    avg_cost_low: 25,
    avg_cost_high: 50,
    avg_cost_national: 35,
    notes: "Administered via injection, oral liquid, or intra-nasal spray."
  },
  {
    name: "Lyme Disease Vaccine",
    slug: "lyme-disease-vaccine-dog",
    category: "Preventative",
    species: ["Dog"],
    description: "A non-core vaccine recommended for dogs living in or traveling to areas heavily populated by deer ticks. Lyme disease can cause severe joint pain and kidney issues.",
    avg_cost_low: 35,
    avg_cost_high: 70,
    avg_cost_national: 45,
    notes: "Usually requires an initial dose in puppies followed by a booster 3 weeks later."
  },
  {
    name: "Feline Leukemia Vaccine (FeLV)",
    slug: "felv-vaccine-cat",
    category: "Preventative",
    species: ["Cat"],
    description: "Protects against the Feline Leukemia Virus, which suppresses the immune system and can cause cancer. Highly recommended for outdoor kittens and cats.",
    avg_cost_low: 25,
    avg_cost_high: 60,
    avg_cost_national: 40,
    notes: "Requires a negative FeLV test prior to administering the vaccine safely."
  },
  {
    name: "Microchipping",
    slug: "microchipping",
    category: "Preventative",
    species: ["Dog", "Cat"],
    description: "A small, rice-sized transponder inserted under the skin between the shoulder blades. Provides permanent identification if your pet ever goes missing.",
    avg_cost_low: 25,
    avg_cost_high: 75,
    avg_cost_national: 45,
    notes: "Check if the cost includes lifetime registry enrollment or if it's an extra fee."
  },
  {
    name: "Heartworm Test",
    slug: "heartworm-test",
    category: "Preventative",
    species: ["Dog", "Cat"],
    description: "A routine blood test to check for the presence of heartworms, which are transmitted by mosquitoes. Required annually before refilling preventative medication.",
    avg_cost_low: 35,
    avg_cost_high: 65,
    avg_cost_national: 50,
    notes: "Usually a 'snap' test that provides results in 10 minutes at the clinic."
  },
  {
    name: "Fecal Exam",
    slug: "fecal-exam",
    category: "Preventative",
    species: ["Dog", "Cat"],
    description: "Microscopic evaluation of a stool sample to detect intestinal parasites like roundworms, hookworms, whipworms, and giardia.",
    avg_cost_low: 25,
    avg_cost_high: 60,
    avg_cost_national: 45,
    notes: "Essential for puppies/kittens, and recommended annually for adult pets."
  },
  {
    name: "Routine Deworming",
    slug: "routine-deworming",
    category: "Preventative",
    species: ["Dog", "Cat"],
    description: "Administration of broad-spectrum anthelminthic medications to eliminate common intestinal parasites.",
    avg_cost_low: 15,
    avg_cost_high: 50,
    avg_cost_national: 25,
    notes: "Price varies significantly by pet's weight and the specific type of worm present."
  },

  // --- DIAGNOSTICS & IMAGING ---
  {
    name: "Complete Blood Count (CBC)",
    slug: "complete-blood-count-cbc",
    category: "Diagnostics",
    species: ["Dog", "Cat"],
    description: "Measures red blood cells, white blood cells, and platelets. Used to detect anemia, infection, inflammation, or clotting disorders.",
    avg_cost_low: 50,
    avg_cost_high: 120,
    avg_cost_national: 85,
    notes: "Often combined with a chemistry panel as pre-anesthetic bloodwork."
  },
  {
    name: "Blood Chemistry Panel",
    slug: "blood-chemistry-panel",
    category: "Diagnostics",
    species: ["Dog", "Cat"],
    description: "Evaluates organ health by measuring enzymes and electrolytes. Vital for diagnosing liver disease, kidney failure, and diabetes.",
    avg_cost_low: 75,
    avg_cost_high: 175,
    avg_cost_national: 120,
    notes: "Often combined with CBC for comprehensive wellness testing."
  },
  {
    name: "Urinalysis",
    slug: "urinalysis",
    category: "Diagnostics",
    species: ["Dog", "Cat"],
    description: "Evaluation of urine to check for urinary tract infections (UTIs), kidney function, or diabetes (via glucose presence).",
    avg_cost_low: 40,
    avg_cost_high: 95,
    avg_cost_national: 60,
    notes: "Sample may be caught free-catch or extracted via ultrasound-guided needle cystocentesis."
  },
  {
    name: "X-ray (Radiographs) - Baseline",
    slug: "xray-radiographs",
    category: "Diagnostics",
    species: ["Dog", "Cat"],
    description: "Digital imaging to visualize bones, heart size, lung fields, or abdominal organs. Essential for diagnosing fractures, foreign bodies, or tumors.",
    avg_cost_low: 150,
    avg_cost_high: 350,
    avg_cost_national: 225,
    notes: "Usually includes 2-3 views. Sedation may cost an additional $50-$100."
  },
  {
    name: "Ultrasound (Abdominal)",
    slug: "abdominal-ultrasound",
    category: "Diagnostics",
    species: ["Dog", "Cat"],
    description: "A non-invasive imaging technique using sound waves to see the real-time structure of internal organs like the liver, spleen, kidneys, and intestines.",
    avg_cost_low: 300,
    avg_cost_high: 600,
    avg_cost_national: 450,
    notes: "Often performed by a traveling board-certified specialist."
  },
  {
    name: "MRI Scan",
    slug: "mri-scan",
    category: "Diagnostics",
    species: ["Dog", "Cat"],
    description: "Magnetic Resonance Imaging. Primarily used for neurological issues involving the brain or spinal cord, like herniated discs or seizures.",
    avg_cost_low: 2500,
    avg_cost_high: 4000,
    avg_cost_national: 3000,
    notes: "Requires deep general anesthesia. Usually only available at specialty hospitals."
  },
  {
    name: "CT Scan",
    slug: "ct-scan",
    category: "Diagnostics",
    species: ["Dog", "Cat"],
    description: "Computed Tomography. Produces 3D cross-sectional images representing slices of the body. Used for nasal tumors, complex fractures, and lung disease.",
    avg_cost_low: 1500,
    avg_cost_high: 2500,
    avg_cost_national: 1800,
    notes: "Like an MRI, requires anesthesia and is typically restricted to specialty referral centers."
  },
  {
    name: "Allergy Testing",
    slug: "allergy-testing",
    category: "Diagnostics",
    species: ["Dog", "Cat"],
    description: "Can be conducted via blood sample (RAST test) or intradermal skin testing by a dermatologist to identify specific environmental triggers.",
    avg_cost_low: 200,
    avg_cost_high: 500,
    avg_cost_national: 300,
    notes: "Skin testing is generally more accurate but more expensive."
  },
  {
    name: "Fine Needle Aspiration / Cytology",
    slug: "fine-needle-aspiration-fna",
    category: "Diagnostics",
    species: ["Dog", "Cat"],
    description: "Extracting a few cells from a lump using a small needle to evaluate them under a microscope. Determining if a mass is benign (lipoma) or malignant.",
    avg_cost_low: 75,
    avg_cost_high: 220,
    avg_cost_national: 135,
    notes: "Price increases if the slide must be sent off to an external lab pathologist."
  },
  {
    name: "Surgical Biopsy",
    slug: "surgical-biopsy",
    category: "Diagnostics",
    species: ["Dog", "Cat"],
    description: "Taking a solid tissue sample from an organ or mass to send to a pathologist for definitive diagnosis when an FNA is inconclusive.",
    avg_cost_low: 350,
    avg_cost_high: 800,
    avg_cost_national: 550,
    notes: "Requires sedation or anesthesia and minor surgery."
  },
  {
    name: "Thyroid Panel (T4)",
    slug: "thyroid-panel",
    category: "Diagnostics",
    species: ["Dog", "Cat"],
    description: "A blood test measuring thyroid hormone. Used to diagnose Hypothyroidism (common in dogs) or Hyperthyroidism (common in older cats).",
    avg_cost_low: 65,
    avg_cost_high: 150,
    avg_cost_national: 95,
    notes: ""
  },

  // --- SURGICAL (ROUTINE) ---
  {
    name: "Spay (Dog)",
    slug: "spay-dog",
    category: "Surgical (Routine)",
    species: ["Dog"],
    description: "Ovariohysterectomy. Surgical removal of a female dog's ovaries and uterus. Prevents pregnancy, pyometra, and reduces mammary cancer risks.",
    avg_cost_low: 200,
    avg_cost_high: 600,
    avg_cost_national: 400,
    notes: "Heavier dogs >50lbs or dogs in heat will generally cost more due to surgical complexity."
  },
  {
    name: "Spay (Cat)",
    slug: "spay-cat",
    category: "Surgical (Routine)",
    species: ["Cat"],
    description: "Surgical removal of a female cat's reproductive organs to prevent heat cycles and kittens.",
    avg_cost_low: 150,
    avg_cost_high: 350,
    avg_cost_national: 220,
    notes: "Extremely cheap at humane societies (often <$100), but private care provides more personalized monitoring."
  },
  {
    name: "Neuter (Dog)",
    slug: "neuter-dog",
    category: "Surgical (Routine)",
    species: ["Dog"],
    description: "Castration. Surgical removal of a male dog's testicles. Eliminates risk of testicular cancer and may reduce roaming behaviors.",
    avg_cost_low: 150,
    avg_cost_high: 450,
    avg_cost_national: 250,
    notes: "Cost increases if the dog has a retained testicle (cryptorchid) requiring abdominal surgery."
  },
  {
    name: "Neuter (Cat)",
    slug: "neuter-cat",
    category: "Surgical (Routine)",
    species: ["Cat"],
    description: "Castration for a male cat. Crucial for indoor cats to prevent intense strong-smelling urine spraying behavior.",
    avg_cost_low: 75,
    avg_cost_high: 250,
    avg_cost_national: 125,
    notes: "A very quick surgery. Often heavily subsidized locally."
  },
  {
    name: "Dental Cleaning (Non-extraction)",
    slug: "dental-cleaning",
    category: "Surgical (Routine)",
    species: ["Dog", "Cat"],
    description: "Full anesthetic professional scaling and polishing of teeth. Includes full-mouth dental x-rays to probe for unseen disease below the gumline.",
    avg_cost_low: 350,
    avg_cost_high: 900,
    avg_cost_national: 550,
    notes: "Pre-anesthetic bloodwork is usually required and highly recommended for senior pets."
  },

  // --- SURGICAL (ADVANCED) ---
  {
    name: "ACL/CCL Rupture Repair (TPLO)",
    slug: "tplo-surgery",
    category: "Surgical (Advanced)",
    species: ["Dog"],
    description: "Tibial Plateau Leveling Osteotomy. The gold standard orthopedic surgery for dogs who have torn their Cranial Cruciate Ligament (the dog equivalent of an ACL).",
    avg_cost_low: 3500,
    avg_cost_high: 6000,
    avg_cost_national: 4500,
    notes: "Cost includes specialty board-certified surgeon fees, implants, and follow-up x-rays."
  },
  {
    name: "Mass / Tumor Removal",
    slug: "mass-removal-surgery",
    category: "Surgical (Advanced)",
    species: ["Dog", "Cat"],
    description: "Surgical excision of a lump or tumor. The complexity wildly varies depending on if it's on the surface (skin tag) or deeply rooted onto muscle or internal organs.",
    avg_cost_low: 300,
    avg_cost_high: 1500,
    avg_cost_national: 750,
    notes: "Excisional biopsy histopathology (sending out the whole mass to check margins) will add $150-$300."
  },
  {
    name: "Foreign Body Removal Surgery",
    slug: "foreign-body-surgery",
    category: "Surgical (Advanced)",
    species: ["Dog", "Cat"],
    description: "Emergency exploratory laparotomy. Opening the abdomen and slicing into the stomach/intestines to remove a blockage (like an ingested toy, sock, or bone).",
    avg_cost_low: 1500,
    avg_cost_high: 4500,
    avg_cost_national: 3000,
    notes: "If sections of intestine died due to blockage (resection and anastomosis), cost reaches the higher end."
  },
  {
    name: "Limb Amputation",
    slug: "limb-amputation",
    category: "Surgical (Advanced)",
    species: ["Dog", "Cat"],
    description: "Removal of a leg, most commonly performed as a last resort due to aggressive bone cancer (osteosarcoma) or severe unrepairable trauma.",
    avg_cost_low: 1000,
    avg_cost_high: 3000,
    avg_cost_national: 1800,
    notes: "Pets generally adapt exceptionally well to living 'tripod' lifestyles."
  },
  {
    name: "Tooth Extraction (Complex/Multiple)",
    slug: "tooth-extraction",
    category: "Surgical (Advanced)",
    species: ["Dog", "Cat"],
    description: "Surgical sectioning and removal of diseased, abscessed, or resorptive teeth. Requires local nerve blocks and gingival flaps.",
    avg_cost_low: 500,
    avg_cost_high: 1500,
    avg_cost_national: 850,
    notes: "Cost is on top of the base dental cleaning. Varies heavily based on the number of roots and teeth pulled."
  },
  {
    name: "Cherry Eye Surgery",
    slug: "cherry-eye-surgery",
    category: "Surgical (Advanced)",
    species: ["Dog"],
    description: "Prolapse of the third eyelid gland. The gland is surgically tacked down back into its pocket (rather than removed, which causes dry eye).",
    avg_cost_low: 400,
    avg_cost_high: 1000,
    avg_cost_national: 700,
    notes: "Highly breed specific; extremely common in Bulldogs, Mastiffs, and Beagles."
  },
  {
    name: "Pyometra Surgery (Emergency Spay)",
    slug: "pyometra-surgery",
    category: "Emergency",
    species: ["Dog", "Cat"],
    description: "A severe, life-threatening infection of the uterus occurring in unspayed female pets. Requires immediate surgical removal of the infected, pus-filled organ.",
    avg_cost_low: 1200,
    avg_cost_high: 3000,
    avg_cost_national: 1800,
    notes: "Considerably more expensive and risky than a preventative routine spay."
  },
  {
    name: "Bladder Stone Removal (Cystotomy)",
    slug: "cystotomy-bladder-stones",
    category: "Surgical (Advanced)",
    species: ["Dog", "Cat"],
    description: "Surgical opening of the urinary bladder to remove calcium oxalate, struvite, or urate stones that are causing severe pain or urinary blockages.",
    avg_cost_low: 1000,
    avg_cost_high: 2500,
    avg_cost_national: 1500,
    notes: "Usually followed by lifelong prescription urinary diets to prevent recurrence."
  },

  // --- ILLNESS & MEDICAL CARE ---
  {
    name: "Ear Infection Treatment",
    slug: "ear-infection-treatment",
    category: "Illness",
    species: ["Dog", "Cat"],
    description: "Diagnosis (ear swab cytology under a microscope) and initial treatment of an otitis externa bacterial or yeast infection. Includes medications.",
    avg_cost_low: 100,
    avg_cost_high: 250,
    avg_cost_national: 145,
    notes: "Long-acting pack medications placed deep in the ear canal are convenient but slightly pricier."
  },
  {
    name: "Urinary Tract Infection (UTI) Treatment",
    slug: "uti-treatment",
    category: "Illness",
    species: ["Dog", "Cat"],
    description: "Includes a sterile urinalysis collection, possible ultrasound confirmation, and a multi-week course of appropriate antibiotics.",
    avg_cost_low: 150,
    avg_cost_high: 350,
    avg_cost_national: 220,
    notes: "If stones are suspected, an x-ray will dramatically increase the bill."
  },
  {
    name: "Heartworm Treatment Injection (Melarsomine)",
    slug: "heartworm-treatment",
    category: "Illness",
    species: ["Dog"],
    description: "Intramuscular injections of Melarsomine into the back muscles to kill adult heartworms. Treated over a rigorous course of a few months.",
    avg_cost_low: 500,
    avg_cost_high: 1500,
    avg_cost_national: 1000,
    notes: "Extremely dependent on dog weight. The larger the dog, the exponentially more expensive the drug."
  },
  {
    name: "Parvovirus Treatment (Hospitalization)",
    slug: "parvo-treatment",
    category: "Emergency",
    species: ["Dog"],
    description: "Intensive care treatment for highly infectious Parvo. Requires strict isolation, IV fluids, anti-nausea meds, and antibiotics for 3-7 days.",
    avg_cost_low: 1000,
    avg_cost_high: 4000,
    avg_cost_national: 2200,
    notes: "At-home outpatient treatments exist for extremely low-income instances, but have much lower survival rates."
  },
  
  // --- EMERGENCY & CRITICAL CARE ---
  {
    name: "Emergency Room Exam / Triage",
    slug: "emergency-room-exam",
    category: "Emergency",
    species: ["Dog", "Cat"],
    description: "The baseline fee just to be seen by an emergency veterinarian after hours, on weekends, or holidays.",
    avg_cost_low: 100,
    avg_cost_high: 250,
    avg_cost_national: 160,
    notes: "Specialty ER clinics generally charge two to three times a normal rDVM exam fee."
  },
  {
    name: "Induce Vomiting (Emesis)",
    slug: "induce-vomiting",
    category: "Emergency",
    species: ["Dog", "Cat"],
    description: "Administration of an anti-nausea antagonist to induce swift vomiting because the pet ate chocolate, grapes, medicine, or foreign objects recently.",
    avg_cost_low: 100,
    avg_cost_high: 300,
    avg_cost_national: 200,
    notes: "Must be done within 2-4 hours of ingestion. Do not attempt hydrogen peroxide at home without vet guidance."
  },
  {
    name: "IV Fluids (Outpatient Sub-Q)",
    slug: "subcutaneous-fluids",
    category: "Illness",
    species: ["Dog", "Cat"],
    description: "Fluids pushed under the skin over the shoulders in milder cases of dehydration or chronic kidney disease. A 'bubble' is formed that absorbs slowly.",
    avg_cost_low: 40,
    avg_cost_high: 90,
    avg_cost_national: 60,
    notes: "Owners can be taught to administer this cheaply at home for chronic patients."
  },
  {
    name: "Overnight Hospitalization & ICU",
    slug: "overnight-hospitalization",
    category: "Emergency",
    species: ["Dog", "Cat"],
    description: "24/7 nursing monitoring in an ICU environment, generally requiring an IV catheter and continuous vitals checks.",
    avg_cost_low: 600,
    avg_cost_high: 1500,
    avg_cost_national: 900,
    notes: "Cost is *per night*. Excludes extra diagnostics and specialized medications."
  },
  {
    name: "Oxygen Therapy Unit",
    slug: "oxygen-therapy",
    category: "Emergency",
    species: ["Dog", "Cat"],
    description: "Placement into a sealed, oxygen-rich incubatable cage for pets suffering from heart failure, asthma, or severe trauma.",
    avg_cost_low: 150,
    avg_cost_high: 500,
    avg_cost_national: 300,
    notes: "Price is usually billed per half-day or 24-hours."
  },
  {
    name: "Blood Transfusion",
    slug: "blood-transfusion",
    category: "Emergency",
    species: ["Dog", "Cat"],
    description: "Sourcing and transfusing packed red blood cells or whole blood for pets with severe anemia, trauma, or immune-mediated diseases.",
    avg_cost_low: 400,
    avg_cost_high: 1000,
    avg_cost_national: 750,
    notes: "Involves cross-matching blood types to prevent rejection."
  },

  // --- END OF LIFE / OTHER ---
  {
    name: "Euthanasia (In-Clinic)",
    slug: "euthanasia-in-clinic",
    category: "Other",
    species: ["Dog", "Cat"],
    description: "Compassionate, humane ending of a pet's suffering via a two-step injection process administered by a veterinarian in an exam room.",
    avg_cost_low: 75,
    avg_cost_high: 250,
    avg_cost_national: 150,
    notes: "Most vets include a brief paw-print impression as a memorial."
  },
  {
    name: "Euthanasia (In-Home Service)",
    slug: "euthanasia-in-home",
    category: "Other",
    species: ["Dog", "Cat"],
    description: "A mobile veterinarian drives to your residence to perform euthanasia where the pet feels most comfortable and stress-free on their own bed.",
    avg_cost_low: 300,
    avg_cost_high: 600,
    avg_cost_national: 450,
    notes: "Highly recommended for extreme anxiety or difficulty transporting a large, lame dog."
  },
  {
    name: "Cremation (Communal)",
    slug: "cremation-communal",
    category: "Other",
    species: ["Dog", "Cat"],
    description: "The pet is respectfully cremated alongside others, and ashes are scattered by the facility. Ashes are *not* returned to the owner.",
    avg_cost_low: 50,
    avg_cost_high: 200,
    avg_cost_national: 125,
    notes: "Significantly scales up based on the pet's final weight in pounds."
  },
  {
    name: "Cremation (Private / Individual)",
    slug: "cremation-private",
    category: "Other",
    species: ["Dog", "Cat"],
    description: "The pet is cremated individually, and their ashes are returned to the owner in a wooden or ceramic urn.",
    avg_cost_low: 150,
    avg_cost_high: 400,
    avg_cost_national: 275,
    notes: "A beautiful way to keep a memorial, though distinctly more expensive depending on weight."
  }
];

async function seedData() {
  console.log(`Starting seed script: Uploading ${procedures.length} highly researched procedures to Supabase...`);

  // We are going to insert everything into the 'procedures' table
  // We use .upsert based on 'slug' so if you run this script twice, it won't duplicate data
  const { data, error } = await supabase
    .from('procedures')
    .upsert(procedures, { onConflict: 'slug' })
    .select();

  if (error) {
    console.error("❌ Seeding Failed:");
    console.error(error.message || error);
    process.exit(1);
  }

  console.log(`✅ Success! Seeded ${data.length} procedures into the database.`);
  console.log("Your programmatic SEO data foundation is securely pushed to Supabase.");
}

seedData();
