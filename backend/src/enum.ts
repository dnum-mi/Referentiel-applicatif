// enums.ts
export enum LifecycleStatus {
  UNDER_CONSTRUCTION = 'under_construction',
  IN_PRODUCTION = 'in_production',
  DECOMMISSIONED = 'decommissioned',
  DECOMMISSIONING = 'decommissioning',
}

export enum ComplianceType {
  REGULATION = 'regulation',
  STANDARD = 'standard',
  POLICY = 'policy',
  CONTRACTUAL = 'contractual',
  SECURITY = 'security',
  PRIVACY = 'privacy',
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  NOT_CONCERNED = 'not_concerned',
}

export enum ExternalSourceType {
  ORGANIZATION = 'organization',
  APPLICATION = 'application',
  REGULATION = 'regulation',
  FINANCIAL = 'financial',
  POPULATION = 'population',
}

export enum ExternalSourceValueType {
  URL = 'url',
  URI = 'uri',
  IDENTIFIER = 'identifier',
  NAME = 'name',
}

export enum AnomalyNotificationStatus {
  PENDING = 'in_pending',
  INPROGRESS = 'in_progress',
  DONE = 'done',
}

export enum ExternalRessourceType {
  DOCUMENTATION = 'documentation',
  SUPERVISION = 'supervision',
  SERVICE = 'service',
}

export enum ActorType {
  RESPONSABLE = 'Responsable',
  EXPLOITATION = 'Exploitation',
  RESPONSABLE_AUTRE = 'ResponsableAutre',
  HEBERGEMENT = 'Hebergement',
  ARCHITECTE_APPLICATIF = 'ArchitecteApplicatif',
  ARCHITECTE_INFRA = 'ArchitecteInfra',
  REPRESENTANT_SSI = 'RepresentantSSI',
  AUTRE = 'Autre',
}
