# Ownership Boundary Validator  
[![Live Demo](https://img.shields.io/badge/Live%20Demo-000?style=for-the-badge)](https://rtfenter.github.io/Ownership-Boundary-Validator/)

### An interactive boundary map that shows where a field crosses privacy, legal, or domain ownership lines it shouldn’t — before data moves across systems.

This project is part of my **Systems of Trust Series**, exploring how distributed systems maintain coherence, truth, and alignment across services, schemas, and teams.

The goal of this validator is to make **ownership boundaries** visible — who owns a field, who is allowed to see it, and where it quietly leaks across systems that were never meant to touch that data.

---

## Purpose

Data issues don't always begin with a breach.  
They begin with a **boundary violation**.

A field crosses into a system where it doesn’t belong:

- PII flows into non-compliant tools  
- sensitive enums reach unintended consumers  
- legal boundaries are crossed between regions  
- domain-owned fields leak outside their owning service  
- vendors receive fields they should never store  

These issues are silent until they become liabilities:

- unexpected audit findings  
- privacy investigation escalations  
- inconsistent data definitions  
- misaligned ownership across services  
- shadow pipelines carrying sensitive fields  

This validator makes boundary violations visible at design-time instead of during incident review.

---

## Features (MVP)

The prototype will include:

- **Field Selector** – pick a field to evaluate across systems and domains  
- **Boundary Lens** – switch between Privacy, Legal, and Domain Ownership views  
- **Three-Zone Boundary Map**  
  - **Zone 1 · Owned & Expected** – systems that should hold the field  
  - **Zone 2 · Shared Under Contract** – allowed recipients under specific rules  
  - **Zone 3 · Out-of-Bounds** – systems that should never process this field  
- **Violation Detection** – highlight every system in Zone 3 with severity tags  
- **Contract Notes** – why a field is allowed or restricted in each zone  
- **Field Drift Warnings** – when a field’s meaning changed and expanded its risk profile  
- **Lightweight client-side experience** – static HTML + JS, no backend required  

This tool focuses on boundary correctness, not full data lineage or governance catalogs — intentionally narrow and high-signal.

---

## Demo Screenshot
<img width="2804" height="1716" alt="Screenshot 2025-11-24 at 09-23-57 Ownership Boundary Validator" src="https://github.com/user-attachments/assets/5322d985-5b29-4720-9ca8-672b0503da24" />


---

## Ownership Boundary Map

    [Zone 1: Owned & Expected]
    Core Services
      |  (contractual sharing)
      v
    [Zone 2: Shared Under Contract]
    Analytics · Billing · Warehouses
      |  (leak or unauthorized flow)
      v
    [Zone 3: Out-of-Bounds]
    Vendors · Marketing Tools · External Pipelines

The validator places each system into one of these three zones for the selected field.

---

## Why Ownership Boundaries Matter

Most boundary violations start as harmless convenience:

- “just add the field to that event”
- “the vendor needs more context”
- “analytics wants this column too”
- “we can use this field for segmentation”

Individually, these seem small.  
Collectively, they erode trust:

- PII spreads uncontrolled  
- domain ownership blurs  
- legal restrictions become unclear  
- teams develop conflicting expectations  
- audits reveal inconsistent treatment of sensitive fields  

When boundaries break, systems lose clarity about:

- who owns a field  
- who is responsible for correctness  
- which systems are allowed to store what  
- which legal rules apply to which data  

This validator turns implicit boundary rules into explicit visual checks.

---

## How This Maps to Real Systems

### Privacy Boundaries  
Evaluate whether a field:

- contains PII or sensitive personal data  
- crosses into non-compliant tools  
- is stored unencrypted where it shouldn’t be  
- violates data minimization guidelines  

Common offenders: `email`, `ip_address`, `geo_location`, `phone_number`.

### Legal / Regional Boundaries  
Check whether:

- region-restricted fields flow into global pipelines  
- GDPR-only data enters U.S. systems  
- contract-restricted vendor boundaries are breached  
- retention policies differ across zones  

Common offenders: `consent_status`, `country_code`, `marketing_consent`.

### Domain Ownership Boundaries  
Ensure that:

- owning services maintain authority over fields  
- downstream consumers don’t override or repurpose meaning  
- cross-domain sharing follows explicit contracts  

Common offenders: `discount_code`, `status`, `reward_points`, `risk_score`.

### Drift of Responsibility  
Even when a field is safe in v1, schema evolution often expands its risk:

- added precision → PII inferred  
- renamed fields → unclear ownership  
- new enum values → broader interpretation  
- reused fields → cross-domain ambiguity  

The validator surfaces where evolution creates new boundary risks.

---

## Part of the Systems of Trust Series

Main repo:  
https://github.com/rtfenter/Systems-of-Trust-Series

---

## Status

MVP is implemented and active.  
The prototype will focus on **zone visualization, contract notes, and violation detection**, not a full lineage or catalog system.

---

## Local Use

Everything will run client-side.

To run locally (once the prototype is implemented):

1. Clone the repo  
2. Open `index.html` in your browser  

That’s it — static HTML + JS, no backend required.
