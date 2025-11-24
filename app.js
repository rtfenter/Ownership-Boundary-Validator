const LENS_LABELS = {
  privacy: "Privacy",
  legal: "Legal / Regional",
  domain: "Domain Ownership"
};

const SEVERITY_LABELS = {
  low: "Expected",
  medium: "Watch",
  high: "Violation"
};

// Field boundary configuration
const FIELDS = [
  {
    id: "email",
    label: "email",
    description: "Primary user contact email used for authentication and communication.",
    owner: "Identity Service",
    classification: "PII – contact",
    boundaries: {
      privacy: {
        summary:
          "Email is high-sensitivity PII. It should remain tightly scoped to identity, auth, and transactional communication layers.",
        zones: {
          owned: [
            {
              id: "identity-service",
              name: "Identity Service",
              role: "Core identity & authentication",
              severity: "low",
              notes: [
                "Authoritative source for user email.",
                "Responsible for correctness and consent state."
              ]
            },
            {
              id: "auth-service",
              name: "Auth Service",
              role: "Login, password reset, MFA",
              severity: "low",
              notes: [
                "Uses email strictly for auth flows.",
                "Must not repurpose email for marketing."
              ]
            }
          ],
          shared: [
            {
              id: "notification-service",
              name: "Notification Service",
              role: "Transactional messaging",
              severity: "medium",
              notes: [
                "Allowed to send system emails (receipts, alerts).",
                "Must respect consent and unsubscribe states from Identity."
              ]
            },
            {
              id: "analytics-warehouse",
              name: "Analytics Warehouse",
              role: "Internal reporting",
              severity: "medium",
              notes: [
                "Can receive hashed or tokenized email for joinability.",
                "Direct raw email storage should be minimized or avoided."
              ]
            }
          ],
          outOfBounds: [
            {
              id: "log-aggregation",
              name: "Logging Cluster",
              role: "Infrastructure logs & traces",
              severity: "high",
              notes: [
                "Raw email in logs is a privacy and retention risk.",
                "Should be aggressively redacted before ingestion."
              ]
            },
            {
              id: "debug-screenshot-tool",
              name: "Third-Party Debug Tool",
              role: "Session replay / screenshots",
              severity: "high",
              notes: [
                "Tool is not authorized for persistent PII storage.",
                "Email should be masked or completely omitted."
              ]
            }
          ]
        }
      },
      legal: {
        summary:
          "Email falls under multiple regulatory regimes (GDPR, CCPA). Regional and vendor boundaries matter.",
        zones: {
          owned: [
            {
              id: "identity-service",
              name: "Identity Service",
              role: "Core identity & authentication",
              severity: "low",
              notes: [
                "Responsible for legal basis (contract, consent, legitimate interest).",
                "Must maintain region-aware consent state."
              ]
            }
          ],
          shared: [
            {
              id: "marketing-platform-eu",
              name: "EU Marketing Platform",
              role: "EU-only marketing tool",
              severity: "medium",
              notes: [
                "Allowed for EU users with explicit consent.",
                "Sync must exclude users without marketing_consent=true."
              ]
            },
            {
              id: "marketing-platform-global",
              name: "Global Marketing Platform",
              role: "Non-EU marketing tool",
              severity: "medium",
              notes: [
                "Can receive email for regions outside GDPR scope or with explicit consent.",
                "Requires regular suppression sync from Identity."
              ]
            }
          ],
          outOfBounds: [
            {
              id: "random-vendor-csv",
              name: "Ad-Hoc Vendor CSV Export",
              role: "One-off exports to vendors",
              severity: "high",
              notes: [
                "Manual CSV exports are a recurring legal risk.",
                "Requires DPA, explicit purpose, and retention enforcement."
              ]
            }
          ]
        }
      },
      domain: {
        summary:
          "Email is owned by Identity. Downstream systems are consumers, not co-owners.",
        zones: {
          owned: [
            {
              id: "identity-service",
              name: "Identity Service",
              role: "Core identity & authentication",
              severity: "low",
              notes: [
                "Single source of truth for email.",
                "Controls updates, verification state, and recovery flows."
              ]
            }
          ],
          shared: [
            {
              id: "notification-service",
              name: "Notification Service",
              role: "Transactional messaging",
              severity: "medium",
              notes: [
                "Consuming system only; must not update or canonicalize emails.",
                "Must treat identity as external authority."
              ]
            },
            {
              id: "support-tool",
              name: "Support Tool",
              role: "Agent console for customer support",
              severity: "medium",
              notes: [
                "Reads email for contact; should not change primary email.",
                "Updates must flow back through Identity APIs."
              ]
            }
          ],
          outOfBounds: [
            {
              id: "shadow-crm",
              name: "Shadow CRM Spreadsheet",
              role: "Unmanaged copy of customers",
              severity: "high",
              notes: [
                "Replicated emails outside official systems.",
                "Breaks ownership and increases risk of drift and leakage."
              ]
            }
          ]
        }
      }
    }
  },
  {
    id: "geo_location",
    label: "geo_location",
    description: "User location information with city-level precision derived from IP or GPS.",
    owner: "Telemetry / Location Service",
    classification: "PII – location",
    boundaries: {
      privacy: {
        summary:
          "Location data is often re-identifying when combined with other fields. Precision and retention matter.",
        zones: {
          owned: [
            {
              id: "location-service",
              name: "Location Service",
              role: "Location resolution and enrichment",
              severity: "low",
              notes: [
                "Responsible for precision and anonymization controls.",
                "Should expose bounded, purpose-specific APIs."
              ]
            }
          ],
          shared: [
            {
              id: "personalization-engine",
              name: "Personalization Engine",
              role: "On-site experiences",
              severity: "medium",
              notes: [
                "Allowed to use approximate location for UX.",
                "Should not persist raw high-precision location beyond session."
              ]
            },
            {
              id: "analytics-warehouse",
              name: "Analytics Warehouse",
              role: "Aggregated reporting",
              severity: "medium",
              notes: [
                "Can store normalized regions for analysis.",
                "Raw GPS-level data should be aggregated or truncated."
              ]
            }
          ],
          outOfBounds: [
            {
              id: "public-logs",
              name: "Public Log Stream",
              role: "Shared operational dashboards",
              severity: "high",
              notes: [
                "Location should be aggregated or removed in publicly viewable dashboards.",
                "Combining with other identifiers can re-identify users."
              ]
            }
          ]
        }
      },
      legal: {
        summary:
          "Location is treated as sensitive in multiple jurisdictions. Cross-border flows and retention are tightly constrained.",
        zones: {
          owned: [
            {
              id: "location-service",
              name: "Location Service",
              role: "Location resolution and enrichment",
              severity: "low",
              notes: [
                "Defines retention and purpose limitations for location.",
                "Must respect regional storage requirements."
              ]
            }
          ],
          shared: [
            {
              id: "fraud-service",
              name: "Fraud Service",
              role: "Risk scoring",
              severity: "medium",
              notes: [
                "Legitimate interest if used to prevent abuse.",
                "Retention and usage must be documented and auditable."
              ]
            }
          ],
          outOfBounds: [
            {
              id: "third-party-marketing",
              name: "Third-Party Ad Network",
              role: "External marketing vendor",
              severity: "high",
              notes: [
                "Sending fine-grained location to ad vendors is a regulatory hot spot.",
                "Requires explicit consent and strict contractual controls."
              ]
            }
          ]
        }
      },
      domain: {
        summary:
          "Location belongs to the telemetry/location domain. Other systems consume derived signals, not raw coordinates.",
        zones: {
          owned: [
            {
              id: "location-service",
              name: "Location Service",
              role: "Location resolution and enrichment",
              severity: "low",
              notes: [
                "Owns schema and semantics for location.",
                "Downstream systems should rely on its abstractions, not reinvent them."
              ]
            }
          ],
          shared: [
            {
              id: "personalization-engine",
              name: "Personalization Engine",
              role: "On-site experiences",
              severity: "medium",
              notes: [
                "Consumes region-level signals, not raw coordinates.",
                "Should not add new meaning or repurpose location fields."
              ]
            }
          ],
          outOfBounds: [
            {
              id: "billing-service",
              name: "Billing Service",
              role: "Invoice generation",
              severity: "high",
              notes: [
                "Location does not belong in billing core domain.",
                "Geo-based tax logic should consume normalized regions, not raw location."
              ]
            }
          ]
        }
      }
    }
  },
  {
    id: "risk_score",
    label: "risk_score",
    description: "Model output indicating fraud or credit risk associated with an entity.",
    owner: "Risk Service",
    classification: "Derived – high sensitivity",
    boundaries: {
      privacy: {
        summary:
          "Risk scores are sensitive derived data. Over-sharing can stigmatize users and leak model behavior.",
        zones: {
          owned: [
            {
              id: "risk-service",
              name: "Risk Service",
              role: "Fraud & risk modeling",
              severity: "low",
              notes: [
                "Source of truth for risk_score semantics.",
                "Responsible for thresholds and explanation metadata."
              ]
            }
          ],
          shared: [
            {
              id: "payments-gateway",
              name: "Payments Gateway",
              role: "Payments routing and holds",
              severity: "medium",
              notes: [
                "Allowed to consume risk_score for hold/approve flows.",
                "Must avoid storing granular scores longer than needed."
              ]
            }
          ],
          outOfBounds: [
            {
              id: "marketing-platform",
              name: "Marketing Platform",
              role: "Campaigns & segmentation",
              severity: "high",
              notes: [
                "Using risk_score for marketing segmentation is a privacy and ethics risk.",
                "Should rely on separate, purpose-built segments instead."
              ]
            }
          ]
        }
      },
      legal: {
        summary:
          "Risk scores may fall under credit, anti-discrimination, or explainability regulations depending on jurisdiction.",
        zones: {
          owned: [
            {
              id: "risk-service",
              name: "Risk Service",
              role: "Fraud & risk modeling",
              severity: "low",
              notes: [
                "Must maintain documentation for model usage and thresholds.",
                "Subject to audit in regulated environments."
              ]
            }
          ],
          shared: [
            {
              id: "compliance-team",
              name: "Compliance Reporting",
              role: "Regulatory oversight",
              severity: "medium",
              notes: [
                "Receives aggregated or pseudonymous reports.",
                "Individual scores should be limited to strict need-to-know basis."
              ]
            }
          ],
          outOfBounds: [
            {
              id: "external-crm",
              name: "External CRM",
              role: "Sales pipeline",
              severity: "high",
              notes: [
                "Attaching risk_score directly to customer records risks discriminatory treatment.",
                "If needed, use coarse-grained flags with legal review."
              ]
            }
          ]
        }
      },
      domain: {
        summary:
          "Risk scores belong exclusively to the risk domain. Other domains can act on outcomes but should not redefine the signal.",
        zones: {
          owned: [
            {
              id: "risk-service",
              name: "Risk Service",
              role: "Fraud & risk modeling",
              severity: "low",
              notes: [
                "Defines score scale, thresholds, and interpretation.",
                "Other domains must not override or transform the core score."
              ]
            }
          ],
          shared: [
            {
              id: "account-lifecycle",
              name: "Account Lifecycle Service",
              role: "Account state management",
              severity: "medium",
              notes: [
                "Consumes risk outcome (allow/block/review) rather than raw score.",
                "Should not build independent risk models on top of risk_score."
              ]
            }
          ],
          outOfBounds: [
            {
              id: "product-analytics",
              name: "Product Analytics",
              role: "Feature usage analysis",
              severity: "high",
              notes: [
                "Combining risk_score with behavioral analytics risks model leakage.",
                "If used, must be aggregated and anonymized with strict controls."
              ]
            }
          ]
        }
      }
    }
  }
];

let currentFieldId = null;
let currentLensKey = "privacy";
let currentSelectedSystemId = null;

function init() {
  const fieldSelect = document.getElementById("field-select");
  const lensSelect = document.getElementById("lens-select");
  const fieldDescriptionEl = document.getElementById("field-description");
  const summaryBadge = document.getElementById("summary-badge");
  const boundaryMapContainer = document.getElementById("boundary-map-container");
  const detailsCard = document.getElementById("details-card");

  // Populate field dropdown
  FIELDS.forEach((field, index) => {
    const option = document.createElement("option");
    option.value = field.id;
    option.textContent = field.label;
    if (index === 0) option.selected = true;
    fieldSelect.appendChild(option);
  });

  // Defaults
  currentFieldId = FIELDS[0]?.id || null;
  currentLensKey = "privacy";

  if (currentFieldId) {
    renderAll(
      getCurrentField(),
      currentLensKey,
      fieldDescriptionEl,
      summaryBadge,
      boundaryMapContainer,
      detailsCard
    );
  }

  fieldSelect.addEventListener("change", () => {
    currentFieldId = fieldSelect.value;
    currentSelectedSystemId = null;
    const field = getCurrentField();
    if (!field) return;
    renderAll(
      field,
      currentLensKey,
      fieldDescriptionEl,
      summaryBadge,
      boundaryMapContainer,
      detailsCard
    );
  });

  lensSelect.addEventListener("change", () => {
    currentLensKey = lensSelect.value;
    currentSelectedSystemId = null;
    const field = getCurrentField();
    if (!field) return;
    renderAll(
      field,
      currentLensKey,
      fieldDescriptionEl,
      summaryBadge,
      boundaryMapContainer,
      detailsCard
    );
  });
}

function getCurrentField() {
  return FIELDS.find((f) => f.id === currentFieldId) || null;
}

function getCurrentLensConfig(field, lensKey) {
  if (!field || !field.boundaries) return null;
  return field.boundaries[lensKey] || null;
}

function renderAll(
  field,
  lensKey,
  fieldDescriptionEl,
  summaryBadge,
  boundaryMapContainer,
  detailsCard
) {
  const lensConfig = getCurrentLensConfig(field, lensKey);

  fieldDescriptionEl.textContent = lensConfig
    ? lensConfig.summary
    : "No boundary configuration found for this field and lens.";

  renderFieldMetadata(field);
  renderSummary(field, lensKey, lensConfig, summaryBadge);
  renderBoundaryMap(field, lensKey, lensConfig, boundaryMapContainer, detailsCard);
  renderDefaultDetails(field, lensKey, lensConfig, detailsCard);
}

function renderFieldMetadata(field) {
  const nameEl = document.getElementById("field-meta-name");
  const classificationEl = document.getElementById("field-meta-classification");
  const ownerEl = document.getElementById("field-meta-owner");

  nameEl.textContent = field ? field.label : "—";
  classificationEl.textContent = field
    ? `Classification: ${field.classification}`
    : "Classification: —";
  ownerEl.textContent = field ? `Primary owner: ${field.owner}` : "Primary owner: —";
}

function renderSummary(field, lensKey, lensConfig, summaryBadge) {
  if (!lensConfig || !lensConfig.zones) {
    summaryBadge.className = "summary-badge summary-badge-idle";
    summaryBadge.textContent = "No boundary configuration defined.";
    return;
  }

  const { owned = [], shared = [], outOfBounds = [] } = lensConfig.zones;
  const totalSystems = owned.length + shared.length + outOfBounds.length;

  let level = "low";
  if (outOfBounds.length > 0) {
    level = "high";
  } else if (shared.length > 0) {
    level = "medium";
  }

  summaryBadge.className = "summary-badge";
  summaryBadge.classList.add(`summary-badge-${level}`);
  summaryBadge.innerHTML = `
    <span class="count">${totalSystems} system${
      totalSystems === 1 ? "" : "s"
    }</span>
    · ${LENS_LABELS[lensKey] || "Boundary"}
    · ${outOfBounds.length} out-of-bounds
  `;
}

function renderBoundaryMap(field, lensKey, lensConfig, container, detailsCard) {
  container.innerHTML = "";

  if (!lensConfig || !lensConfig.zones) {
    const p = document.createElement("p");
    p.className = "map-empty";
    p.textContent = "No boundary map available for this field and lens.";
    container.appendChild(p);
    return;
  }

  const { owned = [], shared = [], outOfBounds = [] } = lensConfig.zones;

  const header = document.createElement("div");
  header.className = "boundary-map-header";

  const title = document.createElement("p");
  title.className = "boundary-map-title";
  title.textContent = "Zones for this field under the selected lens";

  const note = document.createElement("p");
  note.className = "boundary-map-note";
  note.textContent =
    "Zone 1 is where the field belongs, Zone 2 is allowed with contracts, and Zone 3 is out-of-bounds.";
  header.appendChild(title);
  header.appendChild(note);
  container.appendChild(header);

  const zonesWrapper = document.createElement("div");
  zonesWrapper.className = "boundary-zones";

  const systemIndex = buildSystemIndex(lensConfig.zones);

  const zoneConfigs = [
    {
      id: "zone-1",
      title: "Zone 1 · Owned & Expected",
      subtitle: "Systems that should hold this field by design.",
      cssClass: "boundary-zone-1",
      systems: owned
    },
    {
      id: "zone-2",
      title: "Zone 2 · Shared Under Contract",
      subtitle: "Systems allowed to see this field under specific rules.",
      cssClass: "boundary-zone-2",
      systems: shared
    },
    {
      id: "zone-3",
      title: "Zone 3 · Out-of-Bounds",
      subtitle: "Systems that should not process this field.",
      cssClass: "boundary-zone-3",
      systems: outOfBounds
    }
  ];

  zoneConfigs.forEach((zoneConfig) => {
    const zoneEl = document.createElement("div");
    zoneEl.className = `boundary-zone ${zoneConfig.cssClass}`;

    const headerEl = document.createElement("div");
    headerEl.className = "boundary-zone-header";

    const titleEl = document.createElement("p");
    titleEl.className = "boundary-zone-title";
    titleEl.textContent = zoneConfig.title;

    const subtitleEl = document.createElement("p");
    subtitleEl.className = "boundary-zone-subtitle";
    subtitleEl.textContent = zoneConfig.subtitle;

    headerEl.appendChild(titleEl);
    headerEl.appendChild(subtitleEl);
    zoneEl.appendChild(headerEl);

    const listEl = document.createElement("div");
    listEl.className = "system-list";

    if (zoneConfig.systems.length === 0) {
      const empty = document.createElement("p");
      empty.className = "boundary-zone-subtitle";
      empty.textContent = "No systems in this zone.";
      listEl.appendChild(empty);
    } else {
      zoneConfig.systems.forEach((system) => {
        const pill = document.createElement("div");
        pill.className = "system-pill";
        pill.dataset.systemId = system.id;

        if (currentSelectedSystemId === system.id) {
          pill.classList.add("selected");
        }

        const nameEl = document.createElement("div");
        nameEl.className = "system-pill-name";
        nameEl.textContent = system.name;

        const roleEl = document.createElement("div");
        roleEl.className = "system-pill-role";
        roleEl.textContent = system.role;

        const badge = document.createElement("span");
        badge.className = "system-pill-badge";

        const sev = system.severity || "low";
        if (sev === "low") badge.classList.add("system-pill-badge-low");
        else if (sev === "medium") badge.classList.add("system-pill-badge-medium");
        else badge.classList.add("system-pill-badge-high");

        badge.textContent = SEVERITY_LABELS[sev] || "Expected";

        pill.appendChild(nameEl);
        pill.appendChild(roleEl);
        pill.appendChild(badge);

        pill.addEventListener("click", () => {
          currentSelectedSystemId = system.id;
          highlightSelectedSystem(container, system.id);
          renderSystemDetails(system, field, lensKey, detailsCard);
        });

        listEl.appendChild(pill);
      });
    }

    zoneEl.appendChild(listEl);
    zonesWrapper.appendChild(zoneEl);
  });

  container.appendChild(zonesWrapper);

  // If a system is already selected but not present in this lens, reset details.
  if (currentSelectedSystemId && !systemIndex[currentSelectedSystemId]) {
    currentSelectedSystemId = null;
    renderDefaultDetails(field, lensKey, lensConfig, detailsCard);
  }
}

function buildSystemIndex(zones) {
  const index = {};
  ["owned", "shared", "outOfBounds"].forEach((zoneKey) => {
    (zones[zoneKey] || []).forEach((system) => {
      index[system.id] = system;
    });
  });
  return index;
}

function highlightSelectedSystem(container, systemId) {
  const pills = container.querySelectorAll(".system-pill");
  pills.forEach((pill) => {
    if (pill.dataset.systemId === systemId) {
      pill.classList.add("selected");
    } else {
      pill.classList.remove("selected");
    }
  });
}

function renderDefaultDetails(field, lensKey, lensConfig, detailsCard) {
  detailsCard.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = "Boundary Details";
  detailsCard.appendChild(title);

  const meta = document.createElement("p");
  meta.className = "details-meta";
  if (!lensConfig || !lensConfig.zones) {
    meta.textContent = `No boundary configuration defined for field "${field.label}" under ${LENS_LABELS[lensKey]}.`;
    detailsCard.appendChild(meta);
    return;
  }

  const { owned = [], shared = [], outOfBounds = [] } = lensConfig.zones;
  meta.textContent = `${owned.length + shared.length + outOfBounds.length} system${
    owned.length + shared.length + outOfBounds.length === 1 ? "" : "s"
  } mapped across three zones for field "${field.label}".`;
  detailsCard.appendChild(meta);

  const section = document.createElement("div");
  section.className = "details-section";

  const h4 = document.createElement("h4");
  h4.textContent = "How to use this view";
  section.appendChild(h4);

  const p = document.createElement("p");
  p.textContent =
    "Zone 1 shows the systems that own or are expected to hold the field. Zone 2 lists systems that are allowed to see the field under explicit contracts. Zone 3 highlights systems where the field should not appear at all.";
  section.appendChild(p);

  detailsCard.appendChild(section);
}

function renderSystemDetails(system, field, lensKey, detailsCard) {
  detailsCard.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = system.name;
  detailsCard.appendChild(title);

  const meta = document.createElement("p");
  meta.className = "details-meta";
  meta.textContent = `${system.role} · ${
    SEVERITY_LABELS[system.severity || "low"] || "Expected"
  } for field "${field.label}" under ${LENS_LABELS[lensKey]}.`;
  detailsCard.appendChild(meta);

  const section = document.createElement("div");
  section.className = "details-section";

  const h4 = document.createElement("h4");
  h4.textContent = "Contract / Violation Notes";
  section.appendChild(h4);

  const list = document.createElement("ul");
  if (system.notes && system.notes.length) {
    system.notes.forEach((note) => {
      const li = document.createElement("li");
      li.textContent = note;
      list.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No specific notes captured.";
    list.appendChild(li);
  }

  section.appendChild(list);
  detailsCard.appendChild(section);
}

document.addEventListener("DOMContentLoaded", init);
