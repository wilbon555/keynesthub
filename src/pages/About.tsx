import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Building2, Eye, Target, Users, Shield, Lightbulb, Mail, Phone, MapPin, MessageSquare } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-[hsl(215,25%,15%)] text-[hsl(0,0%,100%)] py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215,25%,12%)] to-[hsl(198,89%,25%)] opacity-90" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            About <span className="text-[hsl(35,85%,65%)]">KeyNestHub</span>
          </h1>
          <p className="text-lg md:text-xl leading-relaxed opacity-90">
            We connect buyers, sellers, and agents to find the perfect property, because every key deserves its nest.
          </p>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: Users, title: "People First", desc: "We put our clients at the center of everything we do, building lasting relationships." },
            { icon: Shield, title: "Trust & Transparency", desc: "Verified listings, clear pricing, and honest communication at every step." },
            { icon: Lightbulb, title: "Innovation", desc: "Leveraging technology to make property search smarter, faster, and more accessible." },
          ].map((v) => (
            <div key={v.title} className="text-center p-6 rounded-xl bg-card border border-border shadow-card">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <v.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl grid md:grid-cols-2 gap-12">
          {/* Mission */}
          <div className="flex gap-5">
            <div className="shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center mt-1">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To simplify the property search and rental process through transparency, verified listings, and innovative technology, empowering individuals and businesses to make confident real estate decisions.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="flex gap-5">
            <div className="shrink-0 w-12 h-12 rounded-full bg-accent flex items-center justify-center mt-1">
              <Eye className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become the leading ecosystem for real estate in the region, a trusted platform where every "key" finds its "nest," connecting communities with the spaces they call home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <MessageSquare className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Get in Touch</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Have questions or need assistance? Reach out to our team anytime.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <a
              href="mailto:keynesthub@gmail.com"
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">Email Us</span>
              <span className="text-xs text-muted-foreground">keynesthub@gmail.com</span>
            </a>
            <a
              href="tel:+254701555240"
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">Call Us</span>
              <span className="text-xs text-muted-foreground">+254 701 555 240</span>
            </a>
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border shadow-card">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">Visit Us</span>
              <span className="text-xs text-muted-foreground">Nairobi, Kenya</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 text-center container mx-auto px-4">
        <Building2 className="w-10 h-10 text-primary mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Ready to find your nest?</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Browse verified listings, connect with trusted agents, and make your next move with confidence.
        </p>
        <a
          href="/discover"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-8 py-3 font-medium hover:opacity-90 transition-opacity"
        >
          Explore Properties
        </a>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default About;
