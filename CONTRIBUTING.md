# 🏗 Contributing Standards

## Semantic Commit Strategy
We use the **Conventional Commits** specification. Commits must follow this format:
- `feat:` (New feature)
- `fix:` (Bug fix)
- `perf:` (NPU/GPU optimization)
- `refactor:` (Code cleanup without logic change)

*Example:* `perf(inference): optimize kv-cache for M3-series unified memory`

## Pull Request Guidelines
1. **Atomic Commits:** Do not bundle multiple unrelated changes.
2. **Native Verification:** PRs must be tested on physical hardware, not just the simulator.
3. **Documentation:** Any API change requires an update to the README architecture section.
