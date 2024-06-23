interface Props {
  progress: number;
}

export const CourseProgress = ({ progress }: Props) => {
  return (
    <>
      <div className="bg-white my-28 container mx-auto px-4 sm:px-6 lg:px-8">
        <h4 className="sr-only">Status</h4>
        <p className="text-sm font-medium text-gray-900">Tu progreso</p>
        <div className="mt-6" aria-hidden="true">
          <div className="overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-indigo-600"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-6 hidden grid-cols-5 text-sm font-medium text-gray-600 sm:grid">
            <div className={`${progress > 0 ? "text-indigo-600" : ""}`}>
              Primeros pasos
            </div>
            <div
              className={`text-center ${
                progress >= 25 ? "text-indigo-600" : ""
              }`}
            >
              Ya paso lo difícil
            </div>
            <div
              className={`text-center ${
                progress >= 50 ? "text-indigo-600" : ""
              }`}
            >
              Estas a medio camino
            </div>
            <div
              className={`text-center ${
                progress >= 75 ? "text-indigo-600" : ""
              }`}
            >
              Solo un poco más
            </div>
            <div
              className={`text-right ${
                progress >= 100 ? "text-indigo-600" : ""
              }`}
            >
              ¡Completado!
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
