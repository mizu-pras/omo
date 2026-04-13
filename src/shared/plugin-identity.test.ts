import { describe, it, expect } from "bun:test"
import {
  ACCEPTED_PACKAGE_NAMES,
  CACHE_DIR_NAME,
  CONFIG_BASENAME,
  LOG_FILENAME,
  PLUGIN_NAME,
} from "./plugin-identity"

describe("plugin-identity constants", () => {
  describe("PLUGIN_NAME", () => {
    it("equals para-hyang", () => {
      // given

      // when

      // then
      expect(PLUGIN_NAME).toBe("para-hyang")
    })
  })

  describe("CONFIG_BASENAME", () => {
    it("equals para-hyang", () => {
      // given

      // when

      // then
      expect(CONFIG_BASENAME).toBe("para-hyang")
    })
  })

  describe("LOG_FILENAME", () => {
    it("equals para-hyang.log", () => {
      // given

      // when

      // then
      expect(LOG_FILENAME).toBe("para-hyang.log")
    })
  })

  describe("CACHE_DIR_NAME", () => {
    it("equals para-hyang", () => {
      // given

      // when

      // then
      expect(CACHE_DIR_NAME).toBe("para-hyang")
    })
  })

  describe("ACCEPTED_PACKAGE_NAMES", () => {
    it("lists para-hyang before both legacy package names", () => {
      expect(ACCEPTED_PACKAGE_NAMES).toEqual([
        "para-hyang",
        "oh-my-openagent",
        "oh-my-opencode",
      ])
    })
  })
})
