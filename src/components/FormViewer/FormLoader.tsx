import React, { useState, useEffect } from "react";

interface FormData {
  v4html?: string;
  html?: string;
  name?: string;
  id?: string;
  [key: string]: any;
}

interface FormLoaderProps {
  formId?: string;
  onFormLoad?: (formData: FormData) => void;
  children: (
    formData: FormData | null,
    loading: boolean,
    error: string | null
  ) => React.ReactNode;
}

const FormLoader: React.FC<FormLoaderProps> = ({
  formId = "5375703",
  onFormLoad,
  children,
}) => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load the requested JSON file
        let response = await fetch(`/test-data/forms-json/${formId}.json`);

        // If the file doesn't exist, fallback to default
        if (!response.ok && response.status === 404) {
          console.warn(
            `Form ${formId}.json not found, falling back to default form 5375703.json`
          );
          response = await fetch(`/test-data/forms-json/5375703.json`);
        }

        if (!response.ok) {
          throw new Error(`Failed to load form data: ${response.statusText}`);
        }

        const data: FormData = await response.json();
        setFormData(data);

        if (onFormLoad) {
          onFormLoad(data);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error loading form data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [formId, onFormLoad]);

  return <>{children(formData, loading, error)}</>;
};

export default FormLoader;
