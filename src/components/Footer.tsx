const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-sm text-muted-foreground leading-relaxed max-w-4xl mx-auto">
          <p className="mb-4">
            All content provided on this page is carefully researched, written, and reviewed to maintain a high level of accuracy and reliability. 
            While every effort is made to ensure the information is current and useful, it is shared for general educational and informational purposes only.
          </p>
          <p>
            The material on this page should not be interpreted as professional advice, diagnosis, or treatment in any area, including financial, medical, or legal matters. 
            Readers are strongly advised to verify information independently and consult qualified professionals before making any personal, financial, health, or legal decisions based on the content presented here.
          </p>
        </div>
        <div className="text-center mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Topicmingle. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
