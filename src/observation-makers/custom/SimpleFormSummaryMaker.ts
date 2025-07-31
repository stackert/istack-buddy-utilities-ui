import { IObservationMaker } from "../index";

export class SimpleFormSummaryMaker implements IObservationMaker {
  name = "Simple Form Summary";
  description =
    "Provides basic statistics and summary information about the form";

  getRequiredResources(): string[] {
    return []; // No additional resources needed
  }

  makeObservation(formData: any): any {
    if (!formData) {
      return {
        error: "No form data provided",
        timestamp: new Date().toISOString(),
      };
    }

    // Extract basic form information
    const summary: any = {
      formName: formData.name || "Unnamed Form",
      formId: formData.id || "Unknown ID",
      timestamp: new Date().toISOString(),
      hasHTML: !!(formData.v4html || formData.html),
      htmlLength: (formData.v4html || formData.html || "").length,
      dataKeys: Object.keys(formData),
      dataKeyCount: Object.keys(formData).length,
    };

    // Try to extract field information from HTML if available
    const htmlContent = formData.v4html || formData.html || "";
    if (htmlContent) {
      const inputMatches = htmlContent.match(/<input[^>]*>/gi) || [];
      const selectMatches = htmlContent.match(/<select[^>]*>/gi) || [];
      const textareaMatches = htmlContent.match(/<textarea[^>]*>/gi) || [];

      summary.estimatedFields = {
        inputs: inputMatches.length,
        selects: selectMatches.length,
        textareas: textareaMatches.length,
        total:
          inputMatches.length + selectMatches.length + textareaMatches.length,
      };
    }

    return {
      summary: "Form Analysis Complete",
      details: summary,
      recommendations: this.generateRecommendations(summary),
    };
  }

  private generateRecommendations(summary: any): string[] {
    const recommendations: string[] = [];

    if (!summary.hasHTML) {
      recommendations.push(
        "⚠️ No HTML content found - form may not render properly"
      );
    }

    if (summary.htmlLength > 50000) {
      recommendations.push(
        "📏 Large form detected - consider breaking into multiple pages"
      );
    }

    if (summary.estimatedFields?.total > 20) {
      recommendations.push(
        "📝 Many fields detected - consider using field groups or sections"
      );
    }

    if (summary.estimatedFields?.total === 0) {
      recommendations.push("🔍 No form fields detected - verify HTML content");
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ Form structure looks good!");
    }

    return recommendations;
  }
}
