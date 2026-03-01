## Why

Commercial property buyers evaluate deals with very different decision criteria depending on who they are. Owner/operators need occupancy-cost and business-impact analysis, while landlords prioritize investment returns and risk-adjusted cash flow.

## What Changes

- Build a configurable commercial real estate calculator that supports persona-specific analysis templates.
- Add scenario modeling (base, upside, downside) so users can compare outcomes side by side.
- Provide transparent, traceable formulas for each reported metric.
- Add exportable reports so users can share assumptions and results.

## Capabilities

### New Capabilities
- `persona-calculator-engine`: Configurable financial model inputs and outputs for owner/operator and landlord personas.
- `scenario-comparison`: Multi-scenario comparison, sensitivity views, and risk threshold highlighting.
- `analysis-reporting`: Exportable summary reports with assumptions, formulas, and metric outputs.

### Modified Capabilities
- None.

## Impact

- Adds a calculation engine module and persona metric registry.
- Introduces scenario persistence and comparison APIs.
- Adds frontend workflows for persona selection, assumptions entry, and results visualization.
- Requires test fixtures for financial formula parity and regression safety.
