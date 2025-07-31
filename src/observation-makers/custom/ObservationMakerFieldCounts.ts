import {
  ObservationMakers,
  TreeUtilities,
  EObservationSubjectType,
  ALL_KNOWN_FS_FIELD_TYPES,
  // LogLevel,
} from "istack-buddy-utilities";

import type {
  IObservationContext,
  IObservationResult,
  IObservationLogItem,
  IFsModelForm,
  TFsFieldType,
} from "istack-buddy-utilities";

const knownFieldTypes: TFsFieldType[] = [...ALL_KNOWN_FS_FIELD_TYPES];

type TCountRecord = {
  label: string;
  count: number;
  relatedFields: string[];
};

const otherCountIndexes = [
  "_FIELDS_WITH_CALCULATION_",
  "_FIELDS_WITHOUT_CALCULATION_",
  "_FIELDS_WITH_LOGIC_",
  "_FIELDS_WITHOUT_LOGIC_",
  "_LABEL_HAS_LEADING_OR_TRAILING_WHITESPACE_",
  "_DUPLICATE_LABELS_",
  "_UNIQUE_LABELS_",
] as const;

type TOtherCountIndex = (typeof otherCountIndexes)[number];

const fieldTypes = "";

class ObservationMakerFieldCounts extends ObservationMakers.AbstractObservationMaker {
  protected subjectType = EObservationSubjectType.FORM;
  protected observationClass = this.constructor.name;
  protected messagePrimary = "Field Counts Observation";
  private fieldByTypeCounts: Record<TFsFieldType, TCountRecord>;
  private otherCounts: Record<TOtherCountIndex, TCountRecord> = {} as Record<
    TOtherCountIndex,
    TCountRecord
  >;

  // { [idx: keyof TFsFieldType]: number } = {};

  constructor() {
    super();
    this.fieldByTypeCounts = ALL_KNOWN_FS_FIELD_TYPES.reduce((acc, cur) => {
      acc[cur] = {
        count: 0,
        relatedFields: [],
        label: cur,
      };
      return acc;
    }, {} as Record<TFsFieldType, TCountRecord>);

    // Initialize otherCounts with all required keys
    this.otherCounts = otherCountIndexes.reduce((acc, key) => {
      acc[key] = { label: key, count: 0, relatedFields: [] };
      return acc;
    }, {} as Record<TOtherCountIndex, TCountRecord>);
  }

  getRequiredResources(): string[] {
    return ["formModel"];
  }

  async makeObservation(
    context: IObservationContext
  ): Promise<IObservationResult> {
    const isObservationTrue = false;
    const logItems: IObservationLogItem[] = [];
    const uniqueLabel: Record<string, string[]> = {};
    const formModel: IFsModelForm = context.resources.formModel;

    formModel.getFieldIds().forEach((fieldId) => {
      const fieldModel = formModel.getFieldModelByIdOrThrow(fieldId);

      try {
        this.fieldByTypeCounts[
          fieldModel.getFieldType() as TFsFieldType
        ].relatedFields.push(fieldId);
      } catch (error) {
        const fType = fieldModel.getFieldType();
        const logItem: IObservationLogItem = this.createWarnLogItem(context, {
          subjectId: fieldId,
          messageSecondary: `Field type ${fType} not supported.`,
          relatedEntityIds: [],
        });
        logItems.push(logItem);
      }

      // Count fields with/out calcualtions
      const shallowTree =
        TreeUtilities.FsCalculationGraphShallow.fromCalcStringJson(
          fieldId,
          fieldModel.getCalculationString() || ""
        );

      if (!shallowTree) {
        this.otherCounts["_FIELDS_WITHOUT_CALCULATION_"].relatedFields.push(
          fieldId
        );
      } else {
        this.otherCounts["_FIELDS_WITH_CALCULATION_"].relatedFields.push(
          fieldId
        );
      }

      // Count fields with/out logic
      const logicTree = TreeUtilities.FsFieldVisibilityGraph.fromFormModel(
        fieldId,
        formModel,
        fieldId
      );

      if (logicTree.isEmptyTree()) {
        this.otherCounts["_FIELDS_WITHOUT_LOGIC_"].relatedFields.push(fieldId);
      } else {
        this.otherCounts["_FIELDS_WITH_LOGIC_"].relatedFields.push(fieldId);
      }

      // count fields with leading/trailing whitespace in label
      if (
        fieldModel.labelUserFriendly().trim() != fieldModel.labelUserFriendly()
      ) {
        this.otherCounts[
          "_LABEL_HAS_LEADING_OR_TRAILING_WHITESPACE_"
        ].relatedFields.push(fieldId);
      }

      // count unique labels
      const label = fieldModel.labelUserFriendly();
      if (!uniqueLabel[fieldModel.labelUserFriendly()]) {
        uniqueLabel[fieldModel.labelUserFriendly()] = [fieldId];
      } else {
        uniqueLabel[fieldModel.labelUserFriendly()].push(fieldId);
      }
    }); // end of foreach field loop

    // Count duplicate labels instead of creating separate log items
    let duplicateLabelCount = 0;
    Object.entries(uniqueLabel).forEach(([label, fieldIds]) => {
      if (fieldIds.length > 1) {
        duplicateLabelCount++;
      }
    });

    // Create a single comprehensive form summary message instead of multiple fragments
    const totalFields = formModel.getFieldIds().length;
    const fieldsWithCalculations =
      this.otherCounts["_FIELDS_WITH_CALCULATION_"].relatedFields.length;
    const fieldsWithoutCalculations =
      this.otherCounts["_FIELDS_WITHOUT_CALCULATION_"].relatedFields.length;
    const fieldsWithLogic =
      this.otherCounts["_FIELDS_WITH_LOGIC_"].relatedFields.length;
    const fieldsWithoutLogic =
      this.otherCounts["_FIELDS_WITHOUT_LOGIC_"].relatedFields.length;
    const whitespaceIssues =
      this.otherCounts["_LABEL_HAS_LEADING_OR_TRAILING_WHITESPACE_"]
        .relatedFields.length;

    // Build comprehensive form analysis summary
    const summaryParts = [
      `Form Analysis Summary (${totalFields} total fields)`,
      ``,
      `Field Distribution:`,
      ...Object.entries(this.fieldByTypeCounts).map(
        ([type, count]) => `  • ${type}: ${count.relatedFields.length} fields`
      ),
      ``,
      `Logic & Calculations:`,
      `  • Fields with logic: ${fieldsWithLogic}`,
      `  • Fields without logic: ${fieldsWithoutLogic}`,
      `  • Fields with calculations: ${fieldsWithCalculations}`,
      `  • Fields without calculations: ${fieldsWithoutCalculations}`,
      ``,
      `Label Analysis:`,
      `  • Unique labels: ${
        duplicateLabelCount === 0
          ? "All labels are unique"
          : `${
              Object.keys(uniqueLabel).length - duplicateLabelCount
            } unique, ${duplicateLabelCount} duplicates`
      }`,
    ];

    // Add issues section if any found
    const hasIssues = whitespaceIssues > 0 || duplicateLabelCount > 0;
    if (hasIssues) {
      summaryParts.push(``, `Issues Found:`);
      if (whitespaceIssues > 0) {
        summaryParts.push(
          `  • Label whitespace issues: ${whitespaceIssues} fields`
        );
      }
      if (duplicateLabelCount > 0) {
        summaryParts.push(
          `  • Duplicate labels: ${duplicateLabelCount} labels`
        );
      }
    }

    // Collect all related field IDs for the comprehensive message
    const allRelatedFields = [
      ...this.otherCounts["_FIELDS_WITH_CALCULATION_"].relatedFields,
      ...this.otherCounts["_FIELDS_WITHOUT_CALCULATION_"].relatedFields,
      ...this.otherCounts["_FIELDS_WITH_LOGIC_"].relatedFields,
      ...this.otherCounts["_FIELDS_WITHOUT_LOGIC_"].relatedFields,
      ...this.otherCounts["_LABEL_HAS_LEADING_OR_TRAILING_WHITESPACE_"]
        .relatedFields,
    ];

    // Always use info level - comprehensive summary should be informational
    const logLevel = "createInfoLogItem";
    const comprehensiveLogItem: IObservationLogItem = this[logLevel](context, {
      subjectId: formModel.formId,
      messageSecondary: summaryParts.join("\n"),
      relatedEntityIds: Array.from(new Set(allRelatedFields)), // Remove duplicates
    });
    logItems.push(comprehensiveLogItem);

    return { isObservationTrue: true, logItems };
  }
}
export { ObservationMakerFieldCounts };
