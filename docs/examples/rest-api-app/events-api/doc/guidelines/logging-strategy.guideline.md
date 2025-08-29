# Logging und Error Handling

Diese Logging-Richtlinie definiert eine einheitliche Struktur für das Anwendungslogging, um Fehlerdiagnose, Überwachung und Systemanalyse zu optimieren. Durch konsistente Log-Level wird die Filterung und Priorisierung von Ereignissen erleichtert.

## Log-Level

Die folgenden Log-Level helfen klar zu unterscheiden, wann welche Informationen zu welchem Zweck geloggt werden:

- **DEBUG**: Abfragen und deren Ergebnisse (nur während Entwicklung)
- **INFO**: Information über erfolgreiche Funktionsausführung (ohne Payload)
- **WARN**: Ungewöhnliche, nicht fatale Ereignisse (4xx-Fehler)
- **ERROR**: 5xx-Fehler oder nicht behandelte Ausnahmen

## Funktionen und Komponenten

In Funktionen und Komponenten sollte das Logging den Ausführungsverlauf und insbesondere die Ergebnisse dokumentieren, um Transparenz über den Anwendungsfluss zu gewährleisten.

Jeder Rückgabewert einer Funktion (jedes "return") muss einen Log-Eintrag erzeugen:

### Funktionsaufrufe und Parameter

- **TRACE**: Funktionsaufruf mit Input-Parametern
- **DEBUG**: Start der Funktion ohne Parameter

#### Beispiel:

```typescript
const log = getLogger("userService");

// Beispiel für TRACE: Funktionsaufruf mit Input-Parametern
function getUserDetails(userId, options) {
  log.trace(
    {
      query: {
        userId,
        options,
      },
    },
    "getUserDetails called"
  );

  // Funktionslogik...
  return result;
}

// Beispiel für DEBUG: Start der Funktion ohne Parameter
function initializeUserSystem() {
  log.debug({}, "Initializing user system");

  // Funktionslogik...
  return result;
}
```

### Rückgabewerte

**Größere Funktionen** (API-Routen, Controller, Funktionen die mehrere andere Funktionen steuern):

- **INFO**: Return mit Erfolg
- **WARN**: Return mit Misserfolg (z.B. 4xx-Fehler, ungültige Eingaben)
- **ERROR**: Return mit Fehler oder Throw (z.B. 5xx-Fehler, Ausnahmen)

**Einfache Funktionen** (die keine weiteren Funktionen aufrufen):

- **DEBUG**: Return mit Erfolg
- **WARN**: Return mit Misserfolg
- **ERROR**: Return mit Fehler oder Throw

#### Beispiel:

```typescript
const log = getLogger("processData");

try {
  const result = await processData();
  if (result.success) {
    log.info({}, "Data processed successfully");
    return result;
  } else {
    log.warn({ data: result }, "Data processing unsuccessful");
    return result;
  }
} catch (error) {
  log.error(
    {
      error: {
        status: error.code,
        message: error.message,
        trace: error.stack,
      },
    },
    "Error processing data"
  );
  throw error;
}
```

## Einheitliche Log-Payload

Für eine effektive Analyse und Filterung von Logs ist ein standardisiertes Format der Log-Payload entscheidend. Alle Logs sollten strukturiert als JSON mit konsistenten Attributnamen erfolgen, um eine nahtlose Integration mit Log-Analyse-Tools zu ermöglichen:

### Log-Payload bei Fehlern

**ERROR**: Immer den vollständigen Fehler als "error" im JSON-Format. Bei HTTP- oder API-Fehlern immer mit dem Status Code und der Message.

```typescript
const log = getLogger("connectToDatabase");

try {
  // Code...
} catch (error) {
  log.error(
    {
      error: {
        status: error.code,
        message: error.message,
        trace: error.stack,
      },
    },
    "Database connection failed"
  );
}
```

### Log-Payload bei Funktionsaufrufen

Immer in einem "query" Attribut im JSON.

```typescript
const log = getLogger("userService");

function getUserProfile(userId, options) {
  log.trace(
    {
      query: {
        userId,
        options,
      },
    },
    "Getting user profile"
  );

  // Funktionslogik...
}
```

### Log-Payload bei Rückgabewerten

Immer in einem "data" Attribut.

```typescript
const log = getLogger("orderService");

function processOrder(orderId) {
  // Funktionslogik...

  log.debug(
    {
      data: {
        orderId,
        status: "completed",
        timestamp: new Date().toISOString(),
      },
    },
    "Order processed"
  );

  return result;
}
```

## Sensible Daten

Bei der Protokollierung von Daten muss der Schutz sensibler Informationen stets gewährleistet sein:

- Niemals Passwörter, Tokens oder andere sensible Informationen loggen.
- Bei Bedarf sensible Daten maskieren oder komplett ausschließen.
- Personenbezogene Daten nur in Übereinstimmung mit Datenschutzrichtlinien protokollieren.
- Bei Authentifizierungsvorgängen nur Erfolg/Misserfolg loggen, nicht die Anmeldedaten selbst.

```typescript
// Beispiel: Maskieren sensibler Daten
log.info(
  {
    data: {
      userId: user.id,
      email: maskEmail(user.email), // z.B. j***@example.com
      accessToken: "***", // Token wird nicht geloggt
    },
  },
  "User authenticated"
);
```
