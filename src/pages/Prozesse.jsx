import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ClipboardList, Search, Shield, UserCheck, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PmFramework from "../components/prozesse/PmFramework";
import PageHeader from "../components/PageHeader";

const steps = [
  { icon: ClipboardList, title: "Bedarf klären", desc: "Welches Problem soll gelöst werden? Gibt es bereits eine Lösung in Software & Co?", color: "bg-scnat-teal" },
  { icon: Search, title: "Vorevaluation", desc: "Beschreibung der Software, geschätzte Kosten, Anzahl Nutzer und Datenschutz-Relevanz prüfen.", color: "bg-scnat-orange" },
  { icon: Shield, title: "IT-Check", desc: "Ist das Tool auf der SoLiWebL-Liste? Ist eine Datenschutzprüfung notwendig?", color: "bg-scnat-cyan" },
  { icon: UserCheck, title: "Freigabe", desc: "Entscheidung durch Silvan (Verantwortlicher Digitalisierung) oder GL, abhängig von Kosten und Komplexität.", color: "bg-scnat-red" },
  { icon: Package, title: "Beschaffung & Onboarding", desc: "Lizenz beschaffen, Schulung organisieren und Dokumentation erstellen.", color: "bg-scnat-green" },
];

const initialForm = { name: "", email: "", software: "", useCase: "", users: "", cost: "", personalData: "", notes: "" };

const TABS = [
  { id: "beschaffung", label: "Software beschaffen" },
  { id: "pm", label: "PM-Framework & Sprints" },
];

export default function Prozesse() {
  const [activeTab, setActiveTab] = useState("beschaffung");
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast({ title: "Anfrage eingereicht", description: "Deine Software-Anfrage wurde erfolgreich eingereicht und wird geprüft." });
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div>
      <PageHeader
        title="Prozesse"
        subtitle="Software beschaffen und agile Digitalisierung im Sprint-Rhythmus."
        breadcrumb={[{ label: 'Prozesse' }]}
        seed={11}
        accentColor="#F07800"
      />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-10 w-full sm:w-fit overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "beschaffung" && (
          <div>
            <div className="mb-12">
              <div className="flex flex-col sm:flex-row gap-3">
                {steps.map((step, i) => (
                  <button
                    key={step.title}
                    onClick={() => setActiveStep(i)}
                    className={`flex-1 p-4 rounded-xl border text-left transition-all duration-200 ${
                      activeStep === i ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-1.5 rounded-lg ${step.color} text-white`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">Schritt {i + 1}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-foreground text-sm">{step.title}</h3>
                    {activeStep === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-muted-foreground mt-2 leading-relaxed"
                      >
                        {step.desc}
                      </motion.p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-w-2xl">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Software-Anfrage einreichen</h2>
              <p className="text-muted-foreground mb-8">Fülle das Formular aus, um eine neue Software-Anfrage einzureichen.</p>

              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-xl border border-scnat-green/30 bg-scnat-green/5 text-center">
                  <CheckCircle className="w-12 h-12 text-scnat-green mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-foreground text-lg mb-2">Anfrage eingereicht!</h3>
                  <p className="text-sm text-muted-foreground mb-4">Deine Anfrage wurde erfolgreich eingereicht und wird von der Task Force Digitalisierung geprüft.</p>
                  <button onClick={() => { setSubmitted(false); setForm(initialForm); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-scnat-darkred transition-colors">
                    Neue Anfrage
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Name" value={form.name} onChange={(v) => updateField("name", v)} required />
                    <Field label="E-Mail" type="email" value={form.email} onChange={(v) => updateField("email", v)} required />
                  </div>
                  <Field label="Software-Name" value={form.software} onChange={(v) => updateField("software", v)} required />
                  <Field label="Anwendungsfall / Problem" value={form.useCase} onChange={(v) => updateField("useCase", v)} textarea required />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Erwartete Nutzer (Anzahl)" value={form.users} onChange={(v) => updateField("users", v)} />
                    <Field label="Kosten (Schätzung)" value={form.cost} onChange={(v) => updateField("cost", v)} placeholder="z.B. CHF 500/Jahr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Enthält es Personendaten?</label>
                    <div className="flex gap-3">
                      {["Ja", "Nein", "Unklar"].map((opt) => (
                        <button key={opt} type="button" onClick={() => updateField("personalData", opt)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${form.personalData === opt ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Field label="Anmerkungen" value={form.notes} onChange={(v) => updateField("notes", v)} textarea />
                  <button type="submit" className="w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-scnat-darkred transition-colors">
                    Anfrage einreichen
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab === "pm" && <PmFramework />}
      </motion.div>
    </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", textarea = false, required = false, placeholder }) {
  const cls = "w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}{required && <span className="text-primary ml-0.5">*</span>}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls} placeholder={placeholder} required={required} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} placeholder={placeholder} required={required} />
      )}
    </div>
  );
}
