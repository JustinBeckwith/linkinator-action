# Changelog

## [2.0.0](https://github.com/JustinBeckwith/linkinator-action/compare/linkinator-action-v1.11.0...linkinator-action-v2.0.0) (2025-10-15)


### ⚠ BREAKING CHANGES

* This moves us to v7 of linkinator, with all it's beauty. Also moving to rollup instead of ncc for builds.

### Features

* add automatic branch url rewriting ([#75](https://github.com/JustinBeckwith/linkinator-action/issues/75)) ([446da1b](https://github.com/JustinBeckwith/linkinator-action/commit/446da1bed5a7babb38d0acc3d9da5f7f0c6b924c))
* add directoryListing flag ([#43](https://github.com/JustinBeckwith/linkinator-action/issues/43)) ([0224d59](https://github.com/JustinBeckwith/linkinator-action/commit/0224d5963c60d07eb5fd6bce503ef9f1b9fe3184))
* add support for config files ([#56](https://github.com/JustinBeckwith/linkinator-action/issues/56)) ([ab9ea17](https://github.com/JustinBeckwith/linkinator-action/commit/ab9ea17fa65324856b77a4a4d52a4f1b52abd60d))
* add url rewrites feature ([#73](https://github.com/JustinBeckwith/linkinator-action/issues/73)) ([2d47504](https://github.com/JustinBeckwith/linkinator-action/commit/2d475047904ed8dae142adabcbee292961d565a0))
* add verbosity flag ([#54](https://github.com/JustinBeckwith/linkinator-action/issues/54)) ([4de01e9](https://github.com/JustinBeckwith/linkinator-action/commit/4de01e94c48ec91299d37d7119a9496271cc056c))
* add verbosity setting ([#33](https://github.com/JustinBeckwith/linkinator-action/issues/33)) ([118abd4](https://github.com/JustinBeckwith/linkinator-action/commit/118abd494ccc243cdaf08f16b3240aa768484078))
* expose retry feature in linkinator ([#45](https://github.com/JustinBeckwith/linkinator-action/issues/45)) ([99741ff](https://github.com/JustinBeckwith/linkinator-action/commit/99741fffc8d6c583c4cf4dcae249864f850ceab7))
* linkinator with exponential backoff ([#105](https://github.com/JustinBeckwith/linkinator-action/issues/105)) ([f0460ff](https://github.com/JustinBeckwith/linkinator-action/commit/f0460ff2f7d7bcaf02a30a95e323be21646b3ddf))
* log on retries ([#103](https://github.com/JustinBeckwith/linkinator-action/issues/103)) ([d22e2e7](https://github.com/JustinBeckwith/linkinator-action/commit/d22e2e749d4802af199ed216568639d8adca56b6))
* switch to linkinator 3 and esm ([#117](https://github.com/JustinBeckwith/linkinator-action/issues/117)) ([a6c5f5f](https://github.com/JustinBeckwith/linkinator-action/commit/a6c5f5fdb2a4e14d3669f194ecbe7005b2caa6d2))
* trigger release ([#5](https://github.com/JustinBeckwith/linkinator-action/issues/5)) ([459128c](https://github.com/JustinBeckwith/linkinator-action/commit/459128c1968c82cdb76c5acacfb97630fae287fe))
* update linkinator to 2.14.2 ([#93](https://github.com/JustinBeckwith/linkinator-action/issues/93)) ([78a842e](https://github.com/JustinBeckwith/linkinator-action/commit/78a842e12a8d7e68c90ad82c8bba8e0f850a8036))
* upgrade to linkinator v7 ([#204](https://github.com/JustinBeckwith/linkinator-action/issues/204)) ([cadfd3a](https://github.com/JustinBeckwith/linkinator-action/commit/cadfd3a356d12161cecf80af1982f73fe6103ee1))
* upgrade to node 20 ([#187](https://github.com/JustinBeckwith/linkinator-action/issues/187)) ([17d298f](https://github.com/JustinBeckwith/linkinator-action/commit/17d298f1d2e8a77389dd36fbd8cd1831432256a7))


### Bug Fixes

* add list parsing, update docs and tests ([#24](https://github.com/JustinBeckwith/linkinator-action/issues/24)) ([c35708d](https://github.com/JustinBeckwith/linkinator-action/commit/c35708d70fdd6d59f3f19ce1544e42a1bd937174))
* assume inputs are always strings and enable sourcemaps ([#20](https://github.com/JustinBeckwith/linkinator-action/issues/20)) ([b3a54c6](https://github.com/JustinBeckwith/linkinator-action/commit/b3a54c647dbb35600e635479da0e23b08f9850c2))
* **deps:** patch out of date dependencies ([#145](https://github.com/JustinBeckwith/linkinator-action/issues/145)) ([da9bb75](https://github.com/JustinBeckwith/linkinator-action/commit/da9bb75f19eb15611d9580eabdc31595ec75eb71))
* **deps:** update dependency linkinator to v2.12.2 ([#38](https://github.com/JustinBeckwith/linkinator-action/issues/38)) ([ea9325b](https://github.com/JustinBeckwith/linkinator-action/commit/ea9325bc6613939f8506c6c8c0bfc23292c55b5f))
* **deps:** update dependency linkinator to v2.13.0 ([#40](https://github.com/JustinBeckwith/linkinator-action/issues/40)) ([f598315](https://github.com/JustinBeckwith/linkinator-action/commit/f59831522d35716e6dd73f37ba79c3b34883bbce))
* **deps:** update dependency linkinator to v2.13.1 ([#48](https://github.com/JustinBeckwith/linkinator-action/issues/48)) ([a4a929f](https://github.com/JustinBeckwith/linkinator-action/commit/a4a929f7160ae57842b70258da53a0529be6d34c))
* **deps:** update dependency linkinator to v2.13.4 ([#60](https://github.com/JustinBeckwith/linkinator-action/issues/60)) ([a9e47ed](https://github.com/JustinBeckwith/linkinator-action/commit/a9e47ed33c65b750fc2806f7088071481e46f189))
* **deps:** update dependency linkinator to v2.13.5 ([#62](https://github.com/JustinBeckwith/linkinator-action/issues/62)) ([3fb6d36](https://github.com/JustinBeckwith/linkinator-action/commit/3fb6d36b2eb55011fad69467b4bb8dcad1384825))
* **deps:** update dependency linkinator to v2.13.6 ([#64](https://github.com/JustinBeckwith/linkinator-action/issues/64)) ([ce9d353](https://github.com/JustinBeckwith/linkinator-action/commit/ce9d35347d7c3bfa18f4b1b5cb42a0f8aa04fb16))
* **deps:** update dependency linkinator to v2.14.1 ([#91](https://github.com/JustinBeckwith/linkinator-action/issues/91)) ([e25cb18](https://github.com/JustinBeckwith/linkinator-action/commit/e25cb18a26feed20fe7949a452dc6172acceb0f6))
* **deps:** update dependency linkinator to v2.14.3 ([#95](https://github.com/JustinBeckwith/linkinator-action/issues/95)) ([60a67de](https://github.com/JustinBeckwith/linkinator-action/commit/60a67de301a7e3b60c0256ef6d900bd75194405f))
* **deps:** update dependency linkinator to v2.14.4 ([#97](https://github.com/JustinBeckwith/linkinator-action/issues/97)) ([225cb4d](https://github.com/JustinBeckwith/linkinator-action/commit/225cb4d7b9a285fa33dcb763b5e313e648f555fb))
* **deps:** update dependency linkinator to v2.15.0 ([#100](https://github.com/JustinBeckwith/linkinator-action/issues/100)) ([e117894](https://github.com/JustinBeckwith/linkinator-action/commit/e117894e00a97e897be373681a9789136108ab9f))
* **deps:** update dependency linkinator to v4.0.3 ([#141](https://github.com/JustinBeckwith/linkinator-action/issues/141)) ([a3a83c1](https://github.com/JustinBeckwith/linkinator-action/commit/a3a83c1977df232d1f1bd5c4f67e2d869b9854f0))
* **deps:** update dependency linkinator to v4.1.2 ([#151](https://github.com/JustinBeckwith/linkinator-action/issues/151)) ([6ce2899](https://github.com/JustinBeckwith/linkinator-action/commit/6ce28994e096e04b0fca046df30625d2786b5df5))
* **deps:** update dependency linkinator to v5 ([#155](https://github.com/JustinBeckwith/linkinator-action/issues/155)) ([ec5ca89](https://github.com/JustinBeckwith/linkinator-action/commit/ec5ca89a9d207b4435445e153fa13ca9c495e0d0))
* **deps:** update dependency linkinator to v5.0.1 ([#156](https://github.com/JustinBeckwith/linkinator-action/issues/156)) ([871bd93](https://github.com/JustinBeckwith/linkinator-action/commit/871bd9315d524e99df885927c8c5514ae92278ce))
* **deps:** update dependency linkinator to v5.0.2 ([#159](https://github.com/JustinBeckwith/linkinator-action/issues/159)) ([a5b4c77](https://github.com/JustinBeckwith/linkinator-action/commit/a5b4c77e549a0e5440b583baab55518a673dcb63))
* **deps:** update to linkinator 4.1.1 ([#147](https://github.com/JustinBeckwith/linkinator-action/issues/147)) ([202477c](https://github.com/JustinBeckwith/linkinator-action/commit/202477cf17723814aa65c44f27f36490495e2298))
* **deps:** upgrade to linkinator 2.13.3 ([#51](https://github.com/JustinBeckwith/linkinator-action/issues/51)) ([e42ba53](https://github.com/JustinBeckwith/linkinator-action/commit/e42ba53be79acb572820b2c4347fd1492751a29e))
* **deps:** upgrade to linkinator 4.0 ([#131](https://github.com/JustinBeckwith/linkinator-action/issues/131)) ([6da2530](https://github.com/JustinBeckwith/linkinator-action/commit/6da2530fe05d83886f3753dbad1cac79ae266232))
* **deps:** upgrade to linkinator@2.8.2 ([#26](https://github.com/JustinBeckwith/linkinator-action/issues/26)) ([e0137d6](https://github.com/JustinBeckwith/linkinator-action/commit/e0137d6fd72338066e21245ae709836d6ea07cf4))
* do not log for each scan start ([#58](https://github.com/JustinBeckwith/linkinator-action/issues/58)) ([a56ed85](https://github.com/JustinBeckwith/linkinator-action/commit/a56ed85fb623e4ffe22bfdece8f1445a9aeb5e25))
* do not use ?? because node 12 ([540f6bf](https://github.com/JustinBeckwith/linkinator-action/commit/540f6bffdc6df9b2ffba0dcc95808e71f8500f4e))
* drop dependency on chalk ([#114](https://github.com/JustinBeckwith/linkinator-action/issues/114)) ([258cd43](https://github.com/JustinBeckwith/linkinator-action/commit/258cd438ce9858cb07ced2e8f2d9759b6b5d2f9a))
* only report non-skipped links in total ([#36](https://github.com/JustinBeckwith/linkinator-action/issues/36)) ([4e8623b](https://github.com/JustinBeckwith/linkinator-action/commit/4e8623b487127e7333914912aa55c75ac2bab45d))
* re-generate dist folder ([54efd99](https://github.com/JustinBeckwith/linkinator-action/commit/54efd991588d658376d1623989e8cc1029d3112e))
* rebuild with latest version of linkinator ([#22](https://github.com/JustinBeckwith/linkinator-action/issues/22)) ([7f1137c](https://github.com/JustinBeckwith/linkinator-action/commit/7f1137c52854cfe67b8894ec344ab703824af063))
* **replace:** support running against fork ([#81](https://github.com/JustinBeckwith/linkinator-action/issues/81)) ([e749101](https://github.com/JustinBeckwith/linkinator-action/commit/e749101a16b1c931eeeb2d0c04a3799830c270e1))
* **retry-errors:** fix for retry-errors behavior ([#107](https://github.com/JustinBeckwith/linkinator-action/issues/107)) ([40ce63a](https://github.com/JustinBeckwith/linkinator-action/commit/40ce63ab3f1b213d2926ab23e14d42d3897c99ce))
* set default paths to *.md ([963b5d7](https://github.com/JustinBeckwith/linkinator-action/commit/963b5d79804e41032f19f4da1104895855456e08))
* show per-page rollup on failures ([#76](https://github.com/JustinBeckwith/linkinator-action/issues/76)) ([493ec2b](https://github.com/JustinBeckwith/linkinator-action/commit/493ec2b63286faaaaeea8e0bf81a78ec96405893))
* stop warning for missing PR on target ([#115](https://github.com/JustinBeckwith/linkinator-action/issues/115)) ([5fd3952](https://github.com/JustinBeckwith/linkinator-action/commit/5fd395232f0163c3bd079628715f9eed1f8a3331))
* support comma and spaces in linksToSkip ([#31](https://github.com/JustinBeckwith/linkinator-action/issues/31)) ([b1d2c6a](https://github.com/JustinBeckwith/linkinator-action/commit/b1d2c6a6d3728367a96da21fa2b98f4a62cc0648))
* surface call stack on exceptions in logs ([39886d4](https://github.com/JustinBeckwith/linkinator-action/commit/39886d44902e90613ee287761692c5586dbb303e))
* update build config ([6d267f5](https://github.com/JustinBeckwith/linkinator-action/commit/6d267f5ee8f3cdfd28879220e446c3e153a378f3))
* upgrade linkinator to 4.0.2 ([#134](https://github.com/JustinBeckwith/linkinator-action/issues/134)) ([164630d](https://github.com/JustinBeckwith/linkinator-action/commit/164630d2a09be6df672d9bce7ed7a5750b31aea1))
* use core.warning ([#83](https://github.com/JustinBeckwith/linkinator-action/issues/83)) ([9059023](https://github.com/JustinBeckwith/linkinator-action/commit/9059023adceea2d8e220fa88e320dc923eb7a607))
* use correct format for action.yml ([#7](https://github.com/JustinBeckwith/linkinator-action/issues/7)) ([81459c8](https://github.com/JustinBeckwith/linkinator-action/commit/81459c88e4ca23672130a9d13d1e049f714fe339))
* use node12 for action ([fab90f8](https://github.com/JustinBeckwith/linkinator-action/commit/fab90f892c63085c9d212780862fb5c755a704c1))
* use node16 for the action ([#99](https://github.com/JustinBeckwith/linkinator-action/issues/99)) ([286adda](https://github.com/JustinBeckwith/linkinator-action/commit/286adda63ab2ab4446223c7fc06bd78c5b58627a))

## [1.11.0](https://github.com/JustinBeckwith/linkinator-action/compare/v1.10.4...v1.11.0) (2024-10-09)


### Features

* upgrade to node 20 ([#187](https://github.com/JustinBeckwith/linkinator-action/issues/187)) ([17d298f](https://github.com/JustinBeckwith/linkinator-action/commit/17d298f1d2e8a77389dd36fbd8cd1831432256a7))


### Bug Fixes

* **deps:** update dependency linkinator to v4.1.2 ([#151](https://github.com/JustinBeckwith/linkinator-action/issues/151)) ([6ce2899](https://github.com/JustinBeckwith/linkinator-action/commit/6ce28994e096e04b0fca046df30625d2786b5df5))
* **deps:** update dependency linkinator to v5 ([#155](https://github.com/JustinBeckwith/linkinator-action/issues/155)) ([ec5ca89](https://github.com/JustinBeckwith/linkinator-action/commit/ec5ca89a9d207b4435445e153fa13ca9c495e0d0))
* **deps:** update dependency linkinator to v5.0.1 ([#156](https://github.com/JustinBeckwith/linkinator-action/issues/156)) ([871bd93](https://github.com/JustinBeckwith/linkinator-action/commit/871bd9315d524e99df885927c8c5514ae92278ce))
* **deps:** update dependency linkinator to v5.0.2 ([#159](https://github.com/JustinBeckwith/linkinator-action/issues/159)) ([a5b4c77](https://github.com/JustinBeckwith/linkinator-action/commit/a5b4c77e549a0e5440b583baab55518a673dcb63))

## [1.10.4](https://github.com/JustinBeckwith/linkinator-action/compare/v1.10.3...v1.10.4) (2022-11-13)


### Bug Fixes

* **deps:** patch out of date dependencies ([#145](https://github.com/JustinBeckwith/linkinator-action/issues/145)) ([da9bb75](https://github.com/JustinBeckwith/linkinator-action/commit/da9bb75f19eb15611d9580eabdc31595ec75eb71))
* **deps:** update to linkinator 4.1.1 ([#147](https://github.com/JustinBeckwith/linkinator-action/issues/147)) ([202477c](https://github.com/JustinBeckwith/linkinator-action/commit/202477cf17723814aa65c44f27f36490495e2298))

## [1.10.3](https://github.com/JustinBeckwith/linkinator-action/compare/v1.10.2...v1.10.3) (2022-09-07)


### Bug Fixes

* **deps:** update dependency linkinator to v4.0.3 ([#141](https://github.com/JustinBeckwith/linkinator-action/issues/141)) ([a3a83c1](https://github.com/JustinBeckwith/linkinator-action/commit/a3a83c1977df232d1f1bd5c4f67e2d869b9854f0))

## [1.10.2](https://github.com/JustinBeckwith/linkinator-action/compare/v1.10.1...v1.10.2) (2022-07-11)


### Bug Fixes

* upgrade linkinator to 4.0.2 ([#134](https://github.com/JustinBeckwith/linkinator-action/issues/134)) ([164630d](https://github.com/JustinBeckwith/linkinator-action/commit/164630d2a09be6df672d9bce7ed7a5750b31aea1))

## [1.10.1](https://github.com/JustinBeckwith/linkinator-action/compare/v1.10.0...v1.10.1) (2022-07-09)


### Bug Fixes

* **deps:** upgrade to linkinator 4.0 ([#131](https://github.com/JustinBeckwith/linkinator-action/issues/131)) ([6da2530](https://github.com/JustinBeckwith/linkinator-action/commit/6da2530fe05d83886f3753dbad1cac79ae266232))

## [1.10.0](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.9.2...v1.10.0) (2021-12-23)


### Features

* switch to linkinator 3 and esm ([#117](https://www.github.com/JustinBeckwith/linkinator-action/issues/117)) ([a6c5f5f](https://www.github.com/JustinBeckwith/linkinator-action/commit/a6c5f5fdb2a4e14d3669f194ecbe7005b2caa6d2))

### [1.9.2](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.9.1...v1.9.2) (2021-12-17)


### Bug Fixes

* drop dependency on chalk ([#114](https://www.github.com/JustinBeckwith/linkinator-action/issues/114)) ([258cd43](https://www.github.com/JustinBeckwith/linkinator-action/commit/258cd438ce9858cb07ced2e8f2d9759b6b5d2f9a))
* stop warning for missing PR on target ([#115](https://www.github.com/JustinBeckwith/linkinator-action/issues/115)) ([5fd3952](https://www.github.com/JustinBeckwith/linkinator-action/commit/5fd395232f0163c3bd079628715f9eed1f8a3331))
* use node16 for the action ([#99](https://www.github.com/JustinBeckwith/linkinator-action/issues/99)) ([286adda](https://www.github.com/JustinBeckwith/linkinator-action/commit/286adda63ab2ab4446223c7fc06bd78c5b58627a))

### [1.9.1](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.9.0...v1.9.1) (2021-11-12)


### Bug Fixes

* **retry-errors:** fix for retry-errors behavior ([#107](https://www.github.com/JustinBeckwith/linkinator-action/issues/107)) ([40ce63a](https://www.github.com/JustinBeckwith/linkinator-action/commit/40ce63ab3f1b213d2926ab23e14d42d3897c99ce))

## [1.9.0](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.8.0...v1.9.0) (2021-11-11)


### Features

* linkinator with exponential backoff ([#105](https://www.github.com/JustinBeckwith/linkinator-action/issues/105)) ([f0460ff](https://www.github.com/JustinBeckwith/linkinator-action/commit/f0460ff2f7d7bcaf02a30a95e323be21646b3ddf))

## [1.8.0](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.7.3...v1.8.0) (2021-11-11)


### Features

* log on retries ([#103](https://www.github.com/JustinBeckwith/linkinator-action/issues/103)) ([d22e2e7](https://www.github.com/JustinBeckwith/linkinator-action/commit/d22e2e749d4802af199ed216568639d8adca56b6))

### [1.7.3](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.7.2...v1.7.3) (2021-11-10)


### Bug Fixes

* **deps:** update dependency linkinator to v2.15.0 ([#100](https://www.github.com/JustinBeckwith/linkinator-action/issues/100)) ([e117894](https://www.github.com/JustinBeckwith/linkinator-action/commit/e117894e00a97e897be373681a9789136108ab9f))

### [1.7.2](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.7.1...v1.7.2) (2021-10-06)


### Bug Fixes

* **deps:** update dependency linkinator to v2.14.4 ([#97](https://www.github.com/JustinBeckwith/linkinator-action/issues/97)) ([225cb4d](https://www.github.com/JustinBeckwith/linkinator-action/commit/225cb4d7b9a285fa33dcb763b5e313e648f555fb))

### [1.7.1](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.7.0...v1.7.1) (2021-10-05)


### Bug Fixes

* **deps:** update dependency linkinator to v2.14.3 ([#95](https://www.github.com/JustinBeckwith/linkinator-action/issues/95)) ([60a67de](https://www.github.com/JustinBeckwith/linkinator-action/commit/60a67de301a7e3b60c0256ef6d900bd75194405f))

## [1.7.0](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.6.4...v1.7.0) (2021-10-05)


### Features

* update linkinator to 2.14.2 ([#93](https://www.github.com/JustinBeckwith/linkinator-action/issues/93)) ([78a842e](https://www.github.com/JustinBeckwith/linkinator-action/commit/78a842e12a8d7e68c90ad82c8bba8e0f850a8036))

### [1.6.4](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.6.3...v1.6.4) (2021-10-05)


### Bug Fixes

* **deps:** update dependency linkinator to v2.14.1 ([#91](https://www.github.com/JustinBeckwith/linkinator-action/issues/91)) ([e25cb18](https://www.github.com/JustinBeckwith/linkinator-action/commit/e25cb18a26feed20fe7949a452dc6172acceb0f6))

### [1.6.3](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.6.2...v1.6.3) (2021-08-12)


### Bug Fixes

* use core.warning ([#83](https://www.github.com/JustinBeckwith/linkinator-action/issues/83)) ([9059023](https://www.github.com/JustinBeckwith/linkinator-action/commit/9059023adceea2d8e220fa88e320dc923eb7a607))

### [1.6.2](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.6.1...v1.6.2) (2021-08-11)


### Bug Fixes

* **replace:** support running against fork ([#81](https://www.github.com/JustinBeckwith/linkinator-action/issues/81)) ([e749101](https://www.github.com/JustinBeckwith/linkinator-action/commit/e749101a16b1c931eeeb2d0c04a3799830c270e1))

### [1.6.1](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.6.0...v1.6.1) (2021-07-12)


### Bug Fixes

* show per-page rollup on failures ([#76](https://www.github.com/JustinBeckwith/linkinator-action/issues/76)) ([493ec2b](https://www.github.com/JustinBeckwith/linkinator-action/commit/493ec2b63286faaaaeea8e0bf81a78ec96405893))

## [1.6.0](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.5.4...v1.6.0) (2021-07-09)


### Features

* add automatic branch url rewriting ([#75](https://www.github.com/JustinBeckwith/linkinator-action/issues/75)) ([446da1b](https://www.github.com/JustinBeckwith/linkinator-action/commit/446da1bed5a7babb38d0acc3d9da5f7f0c6b924c))
* add url rewrites feature ([#73](https://www.github.com/JustinBeckwith/linkinator-action/issues/73)) ([2d47504](https://www.github.com/JustinBeckwith/linkinator-action/commit/2d475047904ed8dae142adabcbee292961d565a0))

### [1.5.4](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.5.3...v1.5.4) (2021-02-21)


### Bug Fixes

* **deps:** update dependency linkinator to v2.13.6 ([#64](https://www.github.com/JustinBeckwith/linkinator-action/issues/64)) ([ce9d353](https://www.github.com/JustinBeckwith/linkinator-action/commit/ce9d35347d7c3bfa18f4b1b5cb42a0f8aa04fb16))

### [1.5.3](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.5.2...v1.5.3) (2021-02-17)


### Bug Fixes

* **deps:** update dependency linkinator to v2.13.5 ([#62](https://www.github.com/JustinBeckwith/linkinator-action/issues/62)) ([3fb6d36](https://www.github.com/JustinBeckwith/linkinator-action/commit/3fb6d36b2eb55011fad69467b4bb8dcad1384825))

### [1.5.2](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.5.1...v1.5.2) (2021-02-10)


### Bug Fixes

* **deps:** update dependency linkinator to v2.13.4 ([#60](https://www.github.com/JustinBeckwith/linkinator-action/issues/60)) ([a9e47ed](https://www.github.com/JustinBeckwith/linkinator-action/commit/a9e47ed33c65b750fc2806f7088071481e46f189))

### [1.5.1](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.5.0...v1.5.1) (2021-02-08)


### Bug Fixes

* do not log for each scan start ([#58](https://www.github.com/JustinBeckwith/linkinator-action/issues/58)) ([a56ed85](https://www.github.com/JustinBeckwith/linkinator-action/commit/a56ed85fb623e4ffe22bfdece8f1445a9aeb5e25))

## [1.5.0](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.4.0...v1.5.0) (2021-02-08)


### Features

* add support for config files ([#56](https://www.github.com/JustinBeckwith/linkinator-action/issues/56)) ([ab9ea17](https://www.github.com/JustinBeckwith/linkinator-action/commit/ab9ea17fa65324856b77a4a4d52a4f1b52abd60d))

## [1.4.0](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.3.1...v1.4.0) (2021-02-07)


### Features

* add verbosity flag ([#54](https://www.github.com/JustinBeckwith/linkinator-action/issues/54)) ([4de01e9](https://www.github.com/JustinBeckwith/linkinator-action/commit/4de01e94c48ec91299d37d7119a9496271cc056c))


### Bug Fixes

* **deps:** upgrade to linkinator 2.13.3 ([#51](https://www.github.com/JustinBeckwith/linkinator-action/issues/51)) ([e42ba53](https://www.github.com/JustinBeckwith/linkinator-action/commit/e42ba53be79acb572820b2c4347fd1492751a29e))

### [1.3.1](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.3.0...v1.3.1) (2021-01-12)


### Bug Fixes

* **deps:** update dependency linkinator to v2.13.1 ([#48](https://www.github.com/JustinBeckwith/linkinator-action/issues/48)) ([a4a929f](https://www.github.com/JustinBeckwith/linkinator-action/commit/a4a929f7160ae57842b70258da53a0529be6d34c))

## [1.3.0](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.2.0...v1.3.0) (2021-01-12)


### Features

* expose retry feature in linkinator ([#45](https://www.github.com/JustinBeckwith/linkinator-action/issues/45)) ([99741ff](https://www.github.com/JustinBeckwith/linkinator-action/commit/99741fffc8d6c583c4cf4dcae249864f850ceab7))

## [1.2.0](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.1.3...v1.2.0) (2021-01-10)


### Features

* add directoryListing flag ([#43](https://www.github.com/JustinBeckwith/linkinator-action/issues/43)) ([0224d59](https://www.github.com/JustinBeckwith/linkinator-action/commit/0224d5963c60d07eb5fd6bce503ef9f1b9fe3184))

### [1.1.3](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.1.2...v1.1.3) (2021-01-06)


### Bug Fixes

* **deps:** update dependency linkinator to v2.13.0 ([#40](https://www.github.com/JustinBeckwith/linkinator-action/issues/40)) ([f598315](https://www.github.com/JustinBeckwith/linkinator-action/commit/f59831522d35716e6dd73f37ba79c3b34883bbce))

### [1.1.2](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.1.1...v1.1.2) (2021-01-02)


### Bug Fixes

* **deps:** update dependency linkinator to v2.12.2 ([#38](https://www.github.com/JustinBeckwith/linkinator-action/issues/38)) ([ea9325b](https://www.github.com/JustinBeckwith/linkinator-action/commit/ea9325bc6613939f8506c6c8c0bfc23292c55b5f))

### [1.1.1](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.1.0...v1.1.1) (2020-12-30)


### Bug Fixes

* only report non-skipped links in total ([#36](https://www.github.com/JustinBeckwith/linkinator-action/issues/36)) ([4e8623b](https://www.github.com/JustinBeckwith/linkinator-action/commit/4e8623b487127e7333914912aa55c75ac2bab45d))

## [1.1.0](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.0.10...v1.1.0) (2020-12-30)


### Features

* add verbosity setting ([#33](https://www.github.com/JustinBeckwith/linkinator-action/issues/33)) ([118abd4](https://www.github.com/JustinBeckwith/linkinator-action/commit/118abd494ccc243cdaf08f16b3240aa768484078))


### Bug Fixes

* support comma and spaces in linksToSkip ([#31](https://www.github.com/JustinBeckwith/linkinator-action/issues/31)) ([b1d2c6a](https://www.github.com/JustinBeckwith/linkinator-action/commit/b1d2c6a6d3728367a96da21fa2b98f4a62cc0648))

### [1.0.10](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.0.9...v1.0.10) (2020-12-22)


### Bug Fixes

* **deps:** upgrade to linkinator@2.8.2 ([#26](https://www.github.com/JustinBeckwith/linkinator-action/issues/26)) ([e0137d6](https://www.github.com/JustinBeckwith/linkinator-action/commit/e0137d6fd72338066e21245ae709836d6ea07cf4))

### [1.0.9](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.0.8...v1.0.9) (2020-12-21)


### Bug Fixes

* add list parsing, update docs and tests ([#24](https://www.github.com/JustinBeckwith/linkinator-action/issues/24)) ([c35708d](https://www.github.com/JustinBeckwith/linkinator-action/commit/c35708d70fdd6d59f3f19ce1544e42a1bd937174))
* rebuild with latest version of linkinator ([#22](https://www.github.com/JustinBeckwith/linkinator-action/issues/22)) ([7f1137c](https://www.github.com/JustinBeckwith/linkinator-action/commit/7f1137c52854cfe67b8894ec344ab703824af063))

### [1.0.8](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.0.7...v1.0.8) (2020-12-21)


### Bug Fixes

* assume inputs are always strings and enable sourcemaps ([#20](https://www.github.com/JustinBeckwith/linkinator-action/issues/20)) ([b3a54c6](https://www.github.com/JustinBeckwith/linkinator-action/commit/b3a54c647dbb35600e635479da0e23b08f9850c2))

### [1.0.7](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.0.6...v1.0.7) (2020-12-21)


### Bug Fixes

* surface call stack on exceptions in logs ([39886d4](https://www.github.com/JustinBeckwith/linkinator-action/commit/39886d44902e90613ee287761692c5586dbb303e))

### [1.0.6](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.0.5...v1.0.6) (2020-12-20)


### Bug Fixes

* set default paths to *.md ([963b5d7](https://www.github.com/JustinBeckwith/linkinator-action/commit/963b5d79804e41032f19f4da1104895855456e08))

### [1.0.5](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.0.4...v1.0.5) (2020-12-20)


### Bug Fixes

* re-generate dist folder ([54efd99](https://www.github.com/JustinBeckwith/linkinator-action/commit/54efd991588d658376d1623989e8cc1029d3112e))

### [1.0.4](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.0.3...v1.0.4) (2020-12-20)


### Bug Fixes

* do not use ?? because node 12 ([540f6bf](https://www.github.com/JustinBeckwith/linkinator-action/commit/540f6bffdc6df9b2ffba0dcc95808e71f8500f4e))

### [1.0.3](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.0.2...v1.0.3) (2020-12-20)


### Bug Fixes

* use node12 for action ([fab90f8](https://www.github.com/JustinBeckwith/linkinator-action/commit/fab90f892c63085c9d212780862fb5c755a704c1))

### [1.0.2](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.0.1...v1.0.2) (2020-12-20)


### Bug Fixes

* update build config ([6d267f5](https://www.github.com/JustinBeckwith/linkinator-action/commit/6d267f5ee8f3cdfd28879220e446c3e153a378f3))

### [1.0.1](https://www.github.com/JustinBeckwith/linkinator-action/compare/v1.0.0...v1.0.1) (2020-12-20)


### Bug Fixes

* use correct format for action.yml ([#7](https://www.github.com/JustinBeckwith/linkinator-action/issues/7)) ([81459c8](https://www.github.com/JustinBeckwith/linkinator-action/commit/81459c88e4ca23672130a9d13d1e049f714fe339))

## 1.0.0 (2020-12-20)


### Features

* trigger release ([#5](https://www.github.com/JustinBeckwith/linkinator-action/issues/5)) ([459128c](https://www.github.com/JustinBeckwith/linkinator-action/commit/459128c1968c82cdb76c5acacfb97630fae287fe))
