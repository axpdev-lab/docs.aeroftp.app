---
layout: page
sidebar: false
aside: false
outline: false
title: AeroFTP Test Suite
description: Public record of AeroFTP integration test runs and capability matrices
---

<div class="test-suite">

# AeroFTP Test Suite

Record pubblico dei test AeroFTP: integrazione protocolli, capability AeroAgent, matrice provider. Ogni run è riproducibile, ogni ambiente documentato.

## Scopo

- **Evidenza operativa**: per ogni area, una matrice che mostra cosa funziona, su quale provider, con quale comando
- **Riproducibilità**: comandi esatti e ambienti Docker documentati — chiunque può rieseguire
- **Trasparenza**: pubblichiamo i risultati dei test che passano, gli ambienti, e le metodologie

Questa sezione non è documentazione user-facing. Per le guide all'uso vedi [Getting Started](/getting-started/installation).

## Sezioni

### Protocolli & providers

| Run | Data | Scope |
|-----|------|-------|
| [Docker matrix 2026-04-18](./docker-matrix/2026-04-18) | 2026-04-18 | FTP, SFTP, WebDAV, S3/MinIO su container locali |

### AeroAgent

| Documento | Scope |
|-----------|-------|
| [Capability matrix](./aeroagent/capability-matrix) | 25 capability AeroAgent testate con Gemini e Cohere |

### Metodologia

- [Come riprodurre un run](./methodology)
- [Docker harness](./methodology#docker-harness)

## Note editoriali

- Le pagine usano un layout a tutta larghezza per ospitare matrici tecniche ampie
- I test pubblicati qui usano il binario `aeroftp-cli` e il server MCP integrato; l'app grafica ha il suo percorso QA separato non coperto qui

</div>
