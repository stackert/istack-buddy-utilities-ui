import {
  ObservationMakers,
  EObservationSubjectType,
  Models,
  ELogLevel,
} from "istack-buddy-utilities";
import type {
  IObservationContext,
  IObservationResult,
  IObservationLogItem,
  IFsModelForm,
} from "istack-buddy-utilities";

class OrphanFieldIdObservationMaker extends ObservationMakers.AbstractObservationMaker {
  protected subjectType = EObservationSubjectType.FORM;
  protected observationClass = this.constructor.name;
  protected messagePrimary = "Orphan Field ID Detection";

  getRequiredResources(): string[] {
    return ["formModel"];
  }

  async makeObservation(
    context: IObservationContext
  ): Promise<IObservationResult> {
    const formModel: IFsModelForm = context.resources.formModel;
    const logItems: IObservationLogItem[] = [];
    const validFieldIds = new Set(formModel.getFieldIds());

    formModel.getFieldIds().forEach((fieldId) => {
      const fieldModel = formModel.getFieldModelByIdOrThrow(fieldId);
      const calculationString = fieldModel.getCalculationString();

      if (calculationString) {
        const fieldRefs = calculationString.match(/\{(\d+)\}|field_(\d+)/g);
        fieldRefs?.forEach((ref) => {
          const refId = ref.replace(/[{}field_]/g, "");
          if (!validFieldIds.has(refId)) {
            logItems.push(
              this.createWarnLogItem(context, {
                subjectId: fieldId,
                messageSecondary: `References non-existent field: ${refId}`,
                relatedEntityIds: [fieldId, refId],
              })
            );
          }
        });
      }
    });

    return { logItems };
  }
}

// Usage and demonstration
async function runExample() {
  const formData = {
    id: "12345",
    fields: [
      { id: "100", calculation: "{200} + {300}" },
      { id: "200", calculation: "field_400 * 2" },
      { id: "300", calculation: "5 + 10" },
    ],
  };

  const formModel = new Models.FsModelForm(formData);
  const context = { resources: { formModel } };
  const maker = new OrphanFieldIdObservationMaker();
  const result = await maker.makeObservation(context);

  console.log("Orphan Field ID Detection Results:");
  const warnings = maker.filterBy({ logLevel: ELogLevel.WARN });
  warnings.forEach((item) => {
    console.log(
      `[${item.logLevel}] Field ${item.subjectId}: ${item.messageSecondary}`
    );
  });
}

export { OrphanFieldIdObservationMaker };
