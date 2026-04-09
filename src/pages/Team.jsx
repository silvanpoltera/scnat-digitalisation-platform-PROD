import { motion } from "framer-motion";
import { Mail, Users, Heart, Brain } from "lucide-react";
import PageHeader from "../components/PageHeader";

const lead = { name: "Silvan", role: "Verantwortlicher Digitalisierung", area: "Strategische Leitung", initials: "SP" };

const kiTeam = [
  { name: "David Jezdimirovic", role: "KI-Spezialist", area: "Künstliche Intelligenz", initials: "DJ" },
  { name: "Anina Steinlin", role: "KI-Spezialistin", area: "Künstliche Intelligenz", initials: "AS" },
  { name: "Arber Aziri", role: "KI-Spezialist", area: "Künstliche Intelligenz", initials: "AA" },
];

const colors = [
  "bg-scnat-red", "bg-scnat-teal", "bg-scnat-orange", "bg-scnat-green",
  "bg-scnat-cyan", "bg-scnat-anthrazit", "bg-scnat-pink",
];

function PersonCard({ person, colorClass }) {
  return (
    <div className="group p-5 rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-full ${colorClass} text-white flex items-center justify-center font-heading font-bold text-sm`}>
          {person.initials}
        </div>
        <div className="min-w-0">
          <h3 className="font-heading font-semibold text-foreground text-sm truncate">{person.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{person.role}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
          {person.area}
        </span>
        <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
          <Mail className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function Team() {
  return (
    <div>
      <PageHeader
        title="Task Force & Ansprechpersonen"
        subtitle="Die Task Force Digitalisierung treibt die Transformation gemeinsam voran."
        breadcrumb={[{ label: 'Team' }]}
        seed={25}
        accentColor="#E87A8A"
      />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8">
          <p className="text-txt-secondary max-w-2xl">
            Die Task Force Digitalisierung begleitet die strategische Transformation der SCNAT.
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-sm font-heading font-semibold text-foreground mb-4">Leitung Digitalisierung</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <PersonCard person={lead} colorClass="bg-scnat-red" />
            </motion.div>
          </div>
        </div>

        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-scnat-teal" />
            <h3 className="text-sm font-heading font-semibold text-foreground">KI-Spezialist:innen</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kiTeam.map((person, i) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <PersonCard person={person} colorClass={colors[(i + 1) % colors.length]} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-8 rounded-2xl bg-gradient-to-br from-scnat-red/5 to-scnat-teal/5 border border-border">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-xl bg-scnat-red/10 text-scnat-red shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">Change Agents gesucht!</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3 max-w-2xl">
                Change Agents sind engagierte Mitarbeitende aus verschiedenen Abteilungen, die als Brückenbauer zwischen
                der Task Force und ihren Teams wirken. Sie fördern die digitale Kultur, teilen Best Practices und
                sammeln Feedback aus der Organisation.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-2xl">
                Die SCNAT ist aktiv darum bemüht, Ressourcen für interessierte Mitarbeitende zur Verfügung zu stellen. 
                In Abstimmung mit der Geschäftsleitung und den Abteilungsleiter:innen wird geplant, dass auch Personen, 
                die sich für das Thema und dessen Weitergabe interessieren, die nötige Zeit und Unterstützung erhalten, 
                um als Change Agents wirksam zu werden.
              </p>
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-scnat-darkred transition-colors text-sm">
                  <Users className="w-4 h-4" />
                  Jetzt mitmachen
                </button>
                <span className="text-xs text-muted-foreground">Kontaktiere die Task Force für mehr Infos</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
    </div>
  );
}
